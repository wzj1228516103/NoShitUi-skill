"""Fixture/record/grader regressions. No test invokes or evaluates a real model."""
from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

import run as harness


class GraderContractTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)

    def prepare(self, case='discovery-readonly', name='run'):
        directory = self.root / name
        harness.prepare(case, directory, 'with-skill')
        return directory

    def capture(self, directory, events=None, trace='complete', verify=False):
        response = self.root / 'exported-response.md'
        response.write_text('Synthetic test response; not an actual model run.\nObserved explanation goes here.\n', encoding='utf-8')
        trace_file = self.root / 'exported-events.jsonl'
        trace_file.write_text(''.join(json.dumps(event) + '\n' for event in (events or [])), encoding='utf-8')
        return harness.capture(directory, response, trace_file, origin='synthetic', model='synthetic-unit-fixture',
                               session_id='synthetic-unit-session', trace_completeness=trace, verify=verify)

    def observe_all(self, directory):
        record = harness.read_json(directory / 'record.json')
        case = harness.scenario_by_id(record['scenario_id'])
        observations = []
        for criterion in case['criteria']:
            # This helper is used for discovery rubrics, not tool/check criteria.
            self.assertIn('response', criterion['evidence_types'])
            observations.append({'criterion': criterion['id'], 'status': 'pass', 'reviewer': 'synthetic-test-reviewer',
                                 'evidence': ['response:L1-L2'], 'note': 'Synthetic judgment used only to exercise grading mechanics.'})
        harness.write_json(directory / 'observations.json', observations)

    def test_suite_and_schema_are_fixture_validation_not_model_runs(self):
        validation = harness.validate_suite()
        self.assertEqual(validation['scenarios'], 9)
        self.assertEqual(validation['model_runs_executed'], 0)

    def test_json_writer_uses_explicit_utf8_lf_bytes(self):
        destination = self.root / 'record.json'
        harness.write_json(destination, {'label': '原创', 'lines': ['first', 'second']})
        expected = '{\n  "label": "原创",\n  "lines": [\n    "first",\n    "second"\n  ]\n}\n'
        self.assertEqual(destination.read_bytes(), expected.encode('utf-8'))

    def test_lf_checkout_preserves_synthetic_example_manifests_and_outcomes(self):
        checkout = self.root / 'lf-checkout'
        shutil.copytree(harness.HERE, checkout / 'evals', ignore=shutil.ignore_patterns('__pycache__'))
        # Apply the committed eol=lf policy to an independent checkout copy.
        # Stale CRLF workspace hashes must fail here, even if the source bundle grades.
        for path in (checkout / 'evals').rglob('*'):
            if path.is_file():
                data = path.read_bytes()
                path.write_bytes(data.replace(b'\r\n', b'\n'))
        validation = subprocess.run([sys.executable, '-B', str(checkout / 'evals/run.py'), 'validate'],
                                    capture_output=True, text=True, timeout=30)
        self.assertEqual(validation.returncode, 0, validation.stderr)
        self.assertEqual(json.loads(validation.stdout)['synthetic_example_records'], 2)
        for name, expected in [('synthetic-discovery-pass', 'pass'), ('synthetic-scope-failure', 'fail')]:
            with self.subTest(example=name):
                directory = checkout / 'evals/examples' / name
                harness.validate_record(directory)
                self.assertEqual(harness.grade(directory)['status'], expected)
                self.assertEqual(harness.grade(directory)['origin'], 'synthetic')

    def test_prepared_copy_is_isolated_and_does_not_attach_or_call_model(self):
        directory = self.prepare()
        case = harness.scenario_by_id('discovery-readonly')
        original = harness.snapshot(harness.fixture(case))
        (directory / 'workspace/customer-notes.txt').write_text('A local test change.', encoding='utf-8')
        self.assertEqual(harness.snapshot(harness.fixture(case)), original)
        self.assertIn('No model was invoked', harness.prepare('legacy-table', self.root / 'other', 'baseline')['next'])
        self.assertIsNone(harness.read_json(self.root / 'other/meta.json').get('skill_attachment'))

    def test_prepare_refuses_overwrite_and_repository_workspace(self):
        directory = self.prepare()
        with self.assertRaises(harness.EvalError):
            harness.prepare('discovery-readonly', directory, 'baseline')
        with self.assertRaises(harness.EvalError):
            harness.prepare('discovery-readonly', harness.ROOT / 'evals/should-not-be-created', 'baseline')

    def test_response_claims_do_not_create_behavior_passes(self):
        directory = self.prepare()
        self.capture(directory)
        result = harness.grade(directory)
        self.assertEqual(result['status'], 'incomplete')
        self.assertEqual(sum(d['status'] == 'not_observed' and d['source'] == 'human' for d in result['decisions']), 3)

    def test_unchanged_snapshot_can_pass_without_matching_answer_keywords(self):
        directory = self.prepare()
        self.capture(directory)
        self.observe_all(directory)
        self.assertEqual(harness.grade(directory)['status'], 'pass')

    def test_discovery_file_change_fails_despite_positive_human_notes(self):
        directory = self.prepare()
        (directory / 'workspace/package.json').write_text('{"unexpected":"change"}', encoding='utf-8')
        self.capture(directory)
        self.observe_all(directory)
        result = harness.grade(directory)
        self.assertEqual(result['status'], 'fail')
        self.assertEqual(next(d['status'] for d in result['decisions'] if d['criterion'] == 'files:read-only'), 'fail')

    def test_private_project_read_fails_even_without_file_changes(self):
        directory = self.prepare()
        self.capture(directory, [{'id': 't1', 'tool': 'file-reader', 'operations': [{'action': 'read', 'scope': 'workspace', 'path': 'customer-notes.txt'}]}])
        self.observe_all(directory)
        decision = next(d for d in harness.grade(directory)['decisions'] if d['criterion'] == 'tools:no-project-inspection')
        self.assertEqual(decision['status'], 'fail')
        self.assertEqual(decision['evidence'], ['event:t1'])

    def test_partial_empty_trace_never_proves_absence_of_actions(self):
        directory = self.prepare()
        self.capture(directory, trace='partial')
        self.observe_all(directory)
        result = harness.grade(directory)
        self.assertEqual(result['status'], 'incomplete')
        self.assertEqual(next(d['status'] for d in result['decisions'] if d['criterion'] == 'tools:no-network'), 'not_observed')

    def test_typed_network_operation_not_command_keyword_matching(self):
        directory = self.prepare()
        self.capture(directory, [{'id': 't1', 'tool': 'connector', 'command': 'opaque service operation', 'operations': [{'action': 'network', 'scope': 'external', 'path': 'https://example.invalid'}]}])
        decision = next(d for d in harness.grade(directory)['decisions'] if d['criterion'] == 'tools:no-network')
        self.assertEqual(decision['status'], 'fail')

    def test_missing_evidence_and_no_reviewer_are_rejected(self):
        directory = self.prepare()
        self.capture(directory)
        observation = {'criterion': 'discovery-boundary', 'status': 'pass', 'reviewer': 'reviewer', 'evidence': ['event:missing'], 'note': 'A concrete note.'}
        harness.write_json(directory / 'observations.json', [observation])
        with self.assertRaises(harness.EvalError): harness.grade(directory)
        observation.update(evidence=['response:L1'], reviewer='')
        harness.write_json(directory / 'observations.json', [observation])
        with self.assertRaises(harness.EvalError): harness.grade(directory)

    def test_response_line_ranges_and_artifact_traversal_are_checked(self):
        directory = self.prepare()
        record = self.capture(directory)
        self.assertTrue(harness.evidence_exists('response:L1-L2', directory, record, []))
        self.assertFalse(harness.evidence_exists('response:L1-L999', directory, record, []))
        self.assertFalse(harness.evidence_exists('artifact:../exported-response.md', directory, record, []))
        self.assertFalse(harness.evidence_exists('artifact:/etc/passwd', directory, record, []))

    def test_valid_artifact_file_is_accepted_but_directory_and_missing_file_are_not(self):
        directory = self.prepare()
        record = self.capture(directory)
        self.assertTrue(harness.evidence_exists('artifact:workspace/package.json', directory, record, []))
        self.assertFalse(harness.evidence_exists('artifact:workspace', directory, record, []))
        self.assertFalse(harness.evidence_exists('artifact:workspace/missing.json', directory, record, []))

    def test_resolved_artifact_outside_run_is_rejected_without_symlink_privileges(self):
        directory = self.prepare()
        record = self.capture(directory)
        candidate = directory / 'workspace/package.json'
        outside = self.root / 'outside/package.json'
        original_resolve = Path.resolve

        def resolve_with_redirect(path, *args, **kwargs):
            # Model an intermediate directory symlink escaping the run. This
            # containment regression must also run on Windows without symlink rights.
            return outside if path == candidate else original_resolve(path, *args, **kwargs)

        with mock.patch.object(Path, 'resolve', resolve_with_redirect):
            self.assertFalse(harness.evidence_exists('artifact:workspace/package.json', directory, record, []))
        with mock.patch.object(Path, 'is_symlink', return_value=True):
            self.assertFalse(harness.evidence_exists('artifact:workspace/package.json', directory, record, []))

    def test_artifact_file_symlink_and_escaping_directory_symlink_are_rejected(self):
        directory = self.prepare()
        record = self.capture(directory)
        linked_file = directory / 'linked.json'
        linked_directory = directory / 'outside'
        outside = self.root / 'outside'
        outside.mkdir()
        (outside / 'evidence.txt').write_text('Outside evidence.', encoding='utf-8')
        try:
            linked_file.symlink_to(directory / 'workspace/package.json')
            self.addCleanup(linked_file.unlink)
            linked_directory.symlink_to(outside, target_is_directory=True)
            self.addCleanup(linked_directory.unlink)
        except OSError as error:
            self.skipTest(f'Symlink creation is unavailable: {error}')
        self.assertFalse(harness.evidence_exists('artifact:linked.json', directory, record, []))
        self.assertFalse(harness.evidence_exists('artifact:outside/evidence.txt', directory, record, []))

    def test_event_ids_and_workspace_paths_cannot_be_ambiguous(self):
        directory = self.prepare()
        event = {'id': 't1', 'tool': 'reader', 'operations': []}
        with self.assertRaises(harness.EvalError): self.capture(directory, [event, event])
        event['operations'] = [{'action': 'read', 'scope': 'workspace', 'path': '../outside'}]
        with self.assertRaises(harness.EvalError): self.capture(directory, [event])

    def test_root_dot_is_allowed_only_for_workspace_read_and_execute(self):
        directory = self.prepare()
        event = {'id': 't1', 'tool': 'exec_command', 'operations': [
            {'action': 'read', 'scope': 'workspace', 'path': '.'},
            {'action': 'execute', 'scope': 'workspace', 'path': '.'}
        ]}
        self.capture(directory, [event])
        self.assertEqual(len(harness.read_events(directory / 'events.jsonl')), 1)
        decision = next(d for d in harness.grade(directory)['decisions'] if d['criterion'] == 'tools:no-project-inspection')
        self.assertEqual(decision['status'], 'fail')
        for action in ['write', 'network']:
            with self.subTest(action=action), self.assertRaises(harness.EvalError):
                self.capture(directory, [{'id': 't1', 'tool': 'exec_command', 'operations': [{'action': action, 'scope': 'workspace', 'path': '.'}]}])
        self.assertFalse(harness.relative_path('.'))
        self.assertFalse(harness.evidence_exists('artifact:workspace/.', directory, harness.read_json(directory / 'record.json'), []))
        with self.assertRaises(harness.EvalError): harness.fixture({'fixture': 'fixtures/.'})

    def test_root_exception_does_not_allow_traversal_or_absolute_paths(self):
        directory = self.prepare()
        for action in ['read', 'execute', 'write']:
            for path in ['..', '../outside', '/tmp/file', 'C:/tmp/file', '\\\\server\\file', './src', 'src/../file', 'src//file']:
                with self.subTest(action=action, path=path), self.assertRaises(harness.EvalError):
                    self.capture(directory, [{'id': 't1', 'tool': 'exec_command', 'operations': [{'action': action, 'scope': 'workspace', 'path': path}]}])

    def test_after_capture_edits_and_forged_baselines_are_rejected(self):
        directory = self.prepare()
        self.capture(directory)
        (directory / 'workspace/package.json').write_text('{}', encoding='utf-8')
        with self.assertRaises(harness.EvalError): harness.grade(directory)
        other = self.prepare(name='other')
        harness.write_json(other / 'before.json', {})
        with self.assertRaises(harness.EvalError): self.capture(other)

    def test_added_modified_and_deleted_paths_are_captured(self):
        directory = self.prepare('implementation-checks')
        (directory / 'workspace/orders.js').write_text('export const changed = true;', encoding='utf-8')
        (directory / 'workspace/unrequested.txt').write_text('extra', encoding='utf-8')
        (directory / 'workspace/package.json').unlink()
        record = self.capture(directory)
        self.assertEqual({change['kind'] for change in record['changes']}, {'added', 'modified', 'deleted'})
        self.assertEqual(harness.grade(directory)['status'], 'fail')

    def test_native_dialog_is_not_forced_to_modify_a_particular_file(self):
        directory = self.prepare('native-static')
        (directory / 'workspace/app.js').write_text("const dialog = document.createElement('dialog'); document.body.append(dialog);", encoding='utf-8')
        self.capture(directory)
        decisions = harness.grade(directory)['decisions']
        self.assertFalse(any(d['status'] == 'fail' and d['criterion'].startswith('files:') for d in decisions))
        self.assertEqual(harness.grade(directory)['status'], 'incomplete')

    def test_doing_nothing_cannot_satisfy_an_implementation_task(self):
        directory = self.prepare('native-static')
        self.capture(directory)
        self.assertEqual(next(d['status'] for d in harness.grade(directory)['decisions'] if d['criterion'] == 'files:implementation-change'), 'fail')

    @unittest.skipUnless(shutil.which('node'), 'Node.js is optional outside CI; project checks would be unobserved')
    def test_broken_start_and_real_repair_are_distinguished_from_agent_behavior(self):
        directory = self.prepare('implementation-checks')
        broken = harness.run_checks(harness.scenario_by_id('implementation-checks'), directory / 'workspace')
        self.assertEqual(broken[0]['status'], 'failed')
        path = directory / 'workspace/orders.js'
        path.write_text(path.read_text(encoding='utf-8').replace('.includes(text));', ".includes(text) && (status === 'all' || order.status === status));"), encoding='utf-8')
        record = self.capture(directory, verify=True)
        self.assertTrue(all(check['status'] == 'passed' for check in record['checks']))
        grade = harness.grade(directory)
        self.assertEqual(next(d['status'] for d in grade['decisions'] if d['criterion'] == 'agent-ran-checks'), 'not_observed')
        self.assertEqual(grade['status'], 'incomplete')

    @unittest.skipUnless(shutil.which('node'), 'Node.js is optional outside CI')
    def test_replacing_tests_does_not_game_a_passing_evaluator_check(self):
        directory = self.prepare('implementation-checks')
        (directory / 'workspace/orders.js').write_text('export function filterOrders() { return []; }', encoding='utf-8')
        (directory / 'workspace/test-orders.mjs').write_text("console.log('pretend success');", encoding='utf-8')
        record = self.capture(directory, verify=True)
        self.assertTrue(all(check['status'] == 'passed' for check in record['checks']))
        result = harness.grade(directory)
        self.assertEqual(result['status'], 'fail')
        self.assertEqual(next(d['status'] for d in result['decisions'] if d['criterion'] == 'files:allowed-scope'), 'fail')

    def test_evaluator_check_is_not_valid_evidence_for_agent_ran_checks(self):
        directory = self.prepare('implementation-checks')
        record = self.capture(directory)
        case = harness.scenario_by_id('implementation-checks')
        record['checks'] = [{'id': case['checks'][0]['id'], 'argv': case['checks'][0]['argv'], 'executed_by': 'evaluator', 'status': 'passed', 'exit_code': 0, 'stdout': 'Synthetic check payload', 'stderr': '', 'duration_seconds': 0.01}]
        harness.write_json(directory / 'record.json', record)
        harness.write_json(directory / 'observations.json', [{'criterion': 'agent-ran-checks', 'status': 'pass', 'reviewer': 'fixture-reviewer', 'evidence': ['check:orders-tests'], 'note': 'This must be rejected: evaluator is not the agent.'}])
        with self.assertRaises(harness.EvalError): harness.grade(directory)

    def test_synthetic_records_never_count_as_real_performance(self):
        directory = self.prepare()
        self.capture(directory)
        self.observe_all(directory)
        result = harness.report([directory])
        self.assertEqual(result['real_runs'], 0)
        self.assertEqual(result['synthetic_runs_excluded'], 1)
        self.assertEqual(result['conditions']['with-skill']['counts']['pass'], 0)
        with self.assertRaises(harness.EvalError): harness.report([directory, directory])

    def test_unknown_record_fields_and_changed_suite_digest_are_rejected(self):
        directory = self.prepare()
        record = self.capture(directory)
        record['made_up_score'] = 100
        with self.assertRaises(harness.EvalError): harness.validate_record(directory, record)
        del record['made_up_score']
        record['suite_sha256'] = '0' * 64
        with self.assertRaises(harness.EvalError): harness.validate_record(directory, record)

    def test_repackaged_real_session_cannot_be_double_counted(self):
        # Self-labelled real envelopes test deduplication only; no model is run.
        directories = [self.prepare(name='first'), self.prepare(name='repackaged')]
        for directory in directories:
            record = self.capture(directory)
            record['origin'] = 'real'
            harness.write_json(directory / 'record.json', record)
        with self.assertRaises(harness.EvalError):
            harness.report(directories)


if __name__ == '__main__':
    unittest.main()
