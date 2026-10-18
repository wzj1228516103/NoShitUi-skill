#!/usr/bin/env python3
"""Prepare/capture/grade offline Skill evaluations. Never calls a model API.

Schema/fixture validation and synthetic grader tests are not model evaluations.
Human judgments cite actual response, tool, change, check, or artifact evidence.
"""
from __future__ import annotations

import argparse
import datetime as dt
import fnmatch
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
import uuid

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SUITE_FILE = HERE / 'suite.json'
SCHEMA_FILE = HERE / 'record.schema.json'
EXCLUDED_DIRS = {'.git', 'node_modules', '__pycache__', '.cache', 'dist'}
STATUSES = {'pass', 'fail', 'not_observed'}
ARTIFACTS = {'response': 'response.md', 'events': 'events.jsonl', 'observations': 'observations.json'}


class EvalError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise EvalError(message)


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError) as error:
        raise EvalError(f'{path}: {error}') from error


def write_json(path: Path, value) -> None:
    path.write_bytes((json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def relative_path(value: str) -> bool:
    return (isinstance(value, str) and bool(value) and '\\' not in value and ':' not in value
            and not value.startswith('/') and all(part not in {'', '.', '..'} for part in value.split('/')))


def snapshot(directory: Path) -> dict:
    """Hash files; record symlink targets without following them outside the run."""
    require(directory.is_dir(), f'Missing workspace: {directory}')
    result = {}
    for current, directories, files in os.walk(directory, followlinks=False):
        base = Path(current)
        directories[:] = sorted(d for d in directories if d not in EXCLUDED_DIRS)
        for name in [*directories, *sorted(files)]:
            item = base / name
            if item.is_symlink():
                target = os.readlink(item)
                result[item.relative_to(directory).as_posix()] = {'kind': 'symlink', 'sha256': sha256(target.encode()), 'target': target}
            elif item.is_file():
                require(item.stat().st_size <= 10_000_000, f'Unexpectedly large fixture artifact: {item}')
                data = item.read_bytes()
                result[item.relative_to(directory).as_posix()] = {'kind': 'file', 'sha256': sha256(data), 'bytes': len(data)}
        require(len(result) <= 10000, 'Workspace file limit exceeded')
    return dict(sorted(result.items()))


def changes_between(before: dict, after: dict) -> list[dict]:
    changes = []
    for path in sorted(set(before) | set(after)):
        if before.get(path) == after.get(path):
            continue
        changes.append({'path': path, 'kind': 'added' if path not in before else 'deleted' if path not in after else 'modified',
                        'before': before.get(path), 'after': after.get(path)})
    return changes


def load_suite() -> list[dict]:
    suite = read_json(SUITE_FILE)
    require(suite.get('version') == 1 and isinstance(suite.get('scenarios'), list), 'Unsupported suite format')
    return suite['scenarios']


def scenario_by_id(identifier: str) -> dict:
    found = [case for case in load_suite() if case.get('id') == identifier]
    require(len(found) == 1, f'Unknown or duplicate scenario: {identifier}')
    return found[0]


def fixture(case: dict) -> Path:
    require(relative_path(case['fixture']) and case['fixture'].startswith('fixtures/'), 'Unsafe fixture path')
    path = HERE / case['fixture']
    require(path.is_dir() and not path.is_symlink(), f'Missing fixture: {path}')
    return path


def suite_digest() -> str:
    fixtures = {case['id']: snapshot(fixture(case)) for case in load_suite()}
    return sha256(json.dumps({'suite': read_json(SUITE_FILE), 'fixtures': fixtures}, sort_keys=True).encode())


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def prepare(case_id: str, destination: Path, condition: str) -> dict:
    case = scenario_by_id(case_id)
    require(condition in {'with-skill', 'baseline'}, 'Unknown experiment condition')
    destination = destination.resolve()
    require(not destination.exists(), 'Run directory already exists; use a fresh directory')
    require(destination != ROOT and ROOT not in destination.parents, 'Keep run workspaces outside this repository')
    destination.mkdir(parents=True)
    shutil.copytree(fixture(case), destination / 'workspace')
    try:
        commit = subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], stderr=subprocess.DEVNULL).decode().strip()
    except (OSError, subprocess.CalledProcessError):
        commit = 'unavailable'
    meta = {'schema_version': 1, 'run_id': f'{case_id}-{uuid.uuid4().hex[:12]}', 'scenario_id': case_id,
            'suite_sha256': suite_digest(), 'condition': condition, 'created_at': utc_now(),
            'skill_sha256': sha256((ROOT / 'SKILL.md').read_bytes()), 'source_commit': commit}
    write_json(destination / 'meta.json', meta)
    write_json(destination / 'before.json', snapshot(destination / 'workspace'))
    write_json(destination / 'observations.json', [{'criterion': item['id'], 'status': 'not_observed', 'reviewer': '', 'evidence': [], 'note': ''} for item in case['criteria']])
    (destination / 'task.md').write_text(
        '# Fixed evaluation task\n\n' + case['prompt'] + '\n\n'
        'Exercise environment: offline. Use supplied evidence; do not access external services or install network dependencies. '
        'Package/evidence snapshots are controlled fixtures, not current upstream verification. '
        'Work only in the adjacent workspace. Do not read evaluation rubrics or alter the capture files.\n', encoding='utf-8')
    return {**meta, 'run_directory': str(destination), 'workspace': str(destination / 'workspace'),
            'skill_attachment': str(ROOT / 'SKILL.md') if condition == 'with-skill' else None,
            'next': 'Run the task in an independent model session, export response/tool events, then capture. No model was invoked.'}


def read_events(path: Path) -> list[dict]:
    try:
        events = [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]
    except (OSError, ValueError) as error:
        raise EvalError(f'Invalid tool trace {path}: {error}') from error
    ids = set()
    for event in events:
        require(isinstance(event, dict) and isinstance(event.get('id'), str) and event['id'] and event['id'] not in ids, 'Tool event needs a unique id')
        ids.add(event['id'])
        require(isinstance(event.get('tool'), str) and bool(event['tool']), f'{event["id"]}: missing tool name')
        require(isinstance(event.get('operations'), list), f'{event["id"]}: missing normalized operations')
        for op in event['operations']:
            require(isinstance(op, dict) and op.get('action') in {'read', 'write', 'network', 'execute'} and op.get('scope') in {'workspace', 'skill', 'external', 'other'}, f'{event["id"]}: invalid operation')
            require(isinstance(op.get('path'), str), f'{event["id"]}: missing operation path')
            if op['scope'] == 'workspace':
                root_access = op['path'] == '.' and op['action'] in {'read', 'execute'}
                require(root_access or relative_path(op['path']), f'{event["id"]}: workspace paths must be relative; only read/execute may use the root dot')
        require('command' not in event or isinstance(event['command'], str), 'Event command must be text')
        require('exit_code' not in event or type(event['exit_code']) is int or event['exit_code'] is None, 'Event exit code must be integer or null')
    return events


def run_checks(case: dict, workspace: Path) -> list[dict]:
    """Optional evaluator reruns. These never count as agent-executed checks."""
    checks = []
    for check in case.get('checks', []):
        started = time.monotonic()
        result = {'id': check['id'], 'argv': check['argv'], 'executed_by': 'evaluator'}
        try:
            process = subprocess.run(check['argv'], cwd=workspace, shell=False, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=check['timeout'])
            result.update(status='passed' if process.returncode == 0 else 'failed', exit_code=process.returncode,
                          stdout=process.stdout[-32000:], stderr=process.stderr[-32000:])
        except FileNotFoundError as error:
            result.update(status='unavailable', exit_code=None, stdout='', stderr=str(error))
        except subprocess.TimeoutExpired:
            result.update(status='timeout', exit_code=None, stdout='', stderr='Fixture check exceeded its time limit')
        result['duration_seconds'] = round(time.monotonic() - started, 3)
        checks.append(result)
    return checks


def capture(directory: Path, response: Path, events: Path, *, origin: str, model: str, session_id: str,
            trace_completeness: str, verify: bool = False) -> dict:
    directory = directory.resolve()
    meta = read_json(directory / 'meta.json')
    case = scenario_by_id(meta['scenario_id'])
    require(meta['suite_sha256'] == suite_digest(), 'Suite/fixtures changed since prepare; use their original revision')
    require(bool(model.strip()) and bool(session_id.strip()), 'Provide the actual model label and session identifier, or explicit synthetic labels')
    response_text = response.read_text(encoding='utf-8')
    require(bool(response_text.strip()), 'A captured response cannot be empty')
    event_text = events.read_text(encoding='utf-8')
    read_events(events)
    before = read_json(directory / 'before.json')
    require(before == snapshot(fixture(case)), 'The prepared baseline differs from the fixed fixture')
    (directory / ARTIFACTS['response']).write_text(response_text, encoding='utf-8')
    (directory / ARTIFACTS['events']).write_text(event_text, encoding='utf-8')
    checks = run_checks(case, directory / 'workspace') if verify else []
    after = snapshot(directory / 'workspace')
    record = {**meta, 'origin': origin, 'model': model, 'session_id': session_id,
              'captured_at': utc_now(), 'trace_completeness': trace_completeness,
              'snapshot_excluded_directories': sorted(EXCLUDED_DIRS), 'artifacts': ARTIFACTS,
              'before': before, 'after': after, 'changes': changes_between(before, after), 'checks': checks}
    write_json(directory / 'record.json', record)
    validate_record(directory, record)
    return record


def evidence_exists(reference: str, directory: Path, record: dict, events: list[dict]) -> bool:
    if not isinstance(reference, str) or ':' not in reference:
        return False
    kind, value = reference.split(':', 1)
    if kind == 'response':
        match = re.fullmatch(r'L([1-9][0-9]*)(?:-L?([1-9][0-9]*))?', value)
        if not match:
            return False
        first, last = int(match[1]), int(match[2] or match[1])
        lines = (directory / ARTIFACTS['response']).read_text(encoding='utf-8').splitlines()
        return 1 <= first <= last <= len(lines)
    if kind == 'event':
        return any(event['id'] == value for event in events)
    if kind == 'change':
        return any(change['path'] == value for change in record['changes'])
    if kind == 'check':
        return any(check['id'] == value for check in record['checks'])
    if kind == 'artifact' and relative_path(value):
        candidate = directory / value
        return candidate.is_file() and not candidate.is_symlink() and directory.resolve() in candidate.resolve().parents
    return False


def validate_record(directory: Path, record: dict | None = None) -> tuple[dict, list, list]:
    if record is None:
        record = read_json(directory / 'record.json')
    schema = read_json(SCHEMA_FILE)
    require(isinstance(record, dict) and set(schema['required']) <= set(record), 'Missing required record fields')
    require(set(record) <= set(schema['properties']), 'Unknown record fields')
    require(type(record['schema_version']) is int and record['schema_version'] == 1, 'Unsupported record format')
    require(record['origin'] in {'real', 'synthetic'}, 'Origin must explicitly be real or synthetic')
    require(record['condition'] in {'with-skill', 'baseline'}, 'Unknown experiment condition')
    require(record['trace_completeness'] in {'complete', 'partial', 'none'}, 'Unknown trace completeness')
    require(record['artifacts'] == ARTIFACTS, 'Record artifacts must use the fixed local filenames')
    require(record['suite_sha256'] == suite_digest(), 'Record belongs to a different suite/fixture revision')
    for key in ['run_id', 'model', 'session_id', 'created_at', 'captured_at', 'skill_sha256', 'source_commit']:
        require(isinstance(record[key], str) and bool(record[key].strip()), f'Missing record metadata: {key}')
    for key in ['suite_sha256', 'skill_sha256']:
        require(bool(re.fullmatch('[a-f0-9]{64}', record[key])), f'Invalid SHA-256 metadata: {key}')
    for key in ['created_at', 'captured_at']:
        try:
            require(dt.datetime.fromisoformat(record[key]).tzinfo is not None, f'Timestamp needs a timezone: {key}')
        except ValueError as error:
            raise EvalError(f'Invalid timestamp: {key}') from error
    require(record['snapshot_excluded_directories'] == sorted(EXCLUDED_DIRS), 'Snapshot exclusions differ')
    case = scenario_by_id(record['scenario_id'])
    require(record['before'] == snapshot(fixture(case)), 'Record baseline is not the fixed fixture')
    require(record['after'] == snapshot(directory / 'workspace'), 'Workspace changed after capture; recapture before grading')
    require(record['changes'] == changes_between(record['before'], record['after']), 'Recorded file changes do not match snapshots')
    require(bool((directory / ARTIFACTS['response']).read_text(encoding='utf-8').strip()), 'Missing model response')
    events = read_events(directory / ARTIFACTS['events'])
    require(record['trace_completeness'] != 'none' or not events, 'A trace marked none contains events')
    known_checks = {check['id']: check for check in case.get('checks', [])}
    seen_checks = set()
    require(isinstance(record['checks'], list), 'Checks must be a list')
    for check in record['checks']:
        require(isinstance(check, dict) and check.get('id') in known_checks and check['id'] not in seen_checks, 'Unknown/duplicate evaluator check')
        seen_checks.add(check['id'])
        require(set(schema['$defs']['check']['required']) <= set(check), 'Incomplete evaluator check record')
        require(isinstance(check['stdout'], str) and isinstance(check['stderr'], str) and type(check['duration_seconds']) in {int, float} and 0 <= check['duration_seconds'] < float('inf'), 'Invalid check output/duration')
        require(check.get('executed_by') == 'evaluator' and check.get('argv') == known_checks[check['id']]['argv'], 'Check execution provenance mismatch')
        require(check.get('status') in {'passed', 'failed', 'unavailable', 'timeout'}, 'Invalid check status')
        require((type(check.get('exit_code')) is int and ((check['exit_code'] == 0) == (check['status'] == 'passed'))) if check['status'] in {'passed', 'failed'} else check.get('exit_code') is None, 'Check status and exit code disagree')
    observations = read_json(directory / ARTIFACTS['observations'])
    require(isinstance(observations, list), 'Observations must be a list')
    criteria = {item['id']: item for item in case['criteria']}
    seen = set()
    for observation in observations:
        require(isinstance(observation, dict) and observation.get('criterion') in criteria and observation['criterion'] not in seen, 'Unknown/duplicate observed criterion')
        seen.add(observation['criterion'])
        require(observation.get('status') in STATUSES, 'Invalid observation status')
        require(isinstance(observation.get('evidence'), list) and isinstance(observation.get('note'), str) and isinstance(observation.get('reviewer'), str), 'Invalid observation fields')
        if observation['status'] != 'not_observed':
            require(bool(observation['reviewer'].strip()) and bool(observation['note'].strip()) and bool(observation['evidence']), 'Pass/fail needs a reviewer, explanation and evidence')
            for reference in observation['evidence']:
                require(evidence_exists(reference, directory, record, events), f'Missing/unsafe evidence: {reference}')
                require(reference.split(':', 1)[0] in criteria[observation['criterion']]['evidence_types'], f'Wrong evidence type for {observation["criterion"]}')
    return record, events, observations


def grade(directory: Path) -> dict:
    record, events, observations = validate_record(directory)
    case = scenario_by_id(record['scenario_id'])
    policies = case['policies']
    decisions = []
    def add(identifier, status, detail, evidence):
        decisions.append({'criterion': identifier, 'status': status, 'source': 'automatic', 'detail': detail, 'evidence': evidence})
    changed = [change['path'] for change in record['changes']]
    if policies.get('read_only'):
        add('files:read-only', 'fail' if changed else 'pass', 'Compared complete included-file snapshots; excluded directories are explicitly listed.', [f'change:{p}' for p in changed])
    else:
        outside = [p for p in changed if not any(fnmatch.fnmatchcase(p, pattern) for pattern in policies['allowed_changes'])]
        add('files:allowed-scope', 'fail' if outside else 'pass', 'Only the scenario-authorized paths may change.', [f'change:{p}' for p in outside])
        add('files:implementation-change', 'pass' if changed else 'fail', 'An implementation task needs an actual change; no particular implementation file is prescribed unless the task requires it.', [f'change:{p}' for p in changed])
        missing = [p for p in policies.get('required_changes', []) if p not in changed]
        add('files:required-change', 'fail' if missing else 'pass', f'Required changed paths missing: {missing}', [f'change:{p}' for p in changed])
    links = [p for p, item in record['after'].items() if item['kind'] == 'symlink']
    add('files:no-symlinks', 'fail' if links else 'pass', 'Fixtures do not authorize links outside the captured workspace.', [f'artifact:workspace/{p}' for p in links])
    operations = [(event, op) for event in events for op in event['operations']]
    for enabled, identifier, predicate in [
        (policies.get('offline'), 'tools:no-network', lambda op: op['action'] == 'network'),
        (policies.get('no_workspace_reads'), 'tools:no-project-inspection', lambda op: op['action'] == 'read' and op['scope'] == 'workspace')
    ]:
        if enabled:
            violations = [event['id'] for event, op in operations if predicate(op)]
            status = 'fail' if violations else 'pass' if record['trace_completeness'] == 'complete' else 'not_observed'
            add(identifier, status, 'Uses operator-normalized tool operations; partial/no traces cannot prove absence of an action.', [f'event:{x}' for x in sorted(set(violations))])
    for check in case.get('checks', []):
        actual = next((c for c in record['checks'] if c['id'] == check['id']), None)
        status = 'not_observed' if not actual or actual['status'] == 'unavailable' else 'pass' if actual['status'] == 'passed' else 'fail'
        add(f'check:{check["id"]}', status, 'Independent evaluator rerun; not evidence that the model ran a check.', [f'check:{check["id"]}'] if actual else [])
    observed = {o['criterion']: o for o in observations}
    for criterion in case['criteria']:
        observation = observed.get(criterion['id'])
        decisions.append({'criterion': criterion['id'], 'status': observation['status'] if observation else 'not_observed',
                          'source': 'human', 'detail': criterion['description'], 'reviewer': observation['reviewer'] if observation else '',
                          'note': observation['note'] if observation else '', 'evidence': observation['evidence'] if observation else []})
    counts = {key: sum(d['status'] == key for d in decisions) for key in ['pass', 'fail', 'not_observed']}
    status = 'fail' if counts['fail'] else 'incomplete' if counts['not_observed'] else 'pass'
    return {'run_id': record['run_id'], 'scenario_id': record['scenario_id'], 'origin': record['origin'], 'condition': record['condition'],
            'model': record['model'], 'session_id': record['session_id'], 'status': status, 'counts': counts, 'decisions': decisions,
            'warning': 'Synthetic demonstration; excluded from real model outcomes.' if record['origin'] == 'synthetic' else 'Human-reviewed saved model run; not a sandbox proof or a statistical Skill effectiveness estimate.'}


def report(directories: list[Path]) -> dict:
    grades = [grade(path) for path in directories]
    require(len({g['run_id'] for g in grades}) == len(grades), 'Duplicate run_id would double-count a run')
    real = [g for g in grades if g['origin'] == 'real']
    require(len({(g['session_id'], g['model'], g['scenario_id'], g['condition']) for g in real}) == len(real),
            'The same real session/scenario/condition was repackaged more than once; report it only once')
    return {'real_runs': len(real), 'synthetic_runs_excluded': len(grades) - len(real),
            'conditions': {condition: {'counts': {status: sum(g['status'] == status for g in real if g['condition'] == condition) for status in ['pass', 'fail', 'incomplete']},
                                       'scenarios': sorted({g['scenario_id'] for g in real if g['condition'] == condition})} for condition in ['with-skill', 'baseline']},
            'outcomes': [{key: g[key] for key in ['run_id', 'scenario_id', 'origin', 'condition', 'model', 'session_id', 'status']} for g in grades],
            'note': 'No pass-rate or causal improvement claim is computed. Pair identical scenarios/model/tool access across independent sessions before comparing conditions.'}


def validate_suite() -> dict:
    cases = load_suite()
    require(8 <= len(cases) <= 12, 'Expected 8–12 bounded evaluation scenarios')
    ids = set()
    for case in cases:
        require(isinstance(case.get('id'), str) and case['id'] not in ids and case['id'], 'Duplicate/missing scenario id')
        ids.add(case['id'])
        require(isinstance(case.get('prompt'), str) and bool(case['prompt'].strip()), 'Missing real task prompt')
        require(type(case.get('policies', {}).get('read_only')) is bool and case['policies'].get('offline') is True, 'All fixtures use a fixed offline exercise environment')
        if not case['policies']['read_only']:
            require(bool(case['policies'].get('allowed_changes')), 'Implementation scope must be explicit')
        require(bool(snapshot(fixture(case))), 'Empty fixture')
        require(all(item['kind'] == 'file' for item in snapshot(fixture(case)).values()), 'Fixture symlinks are not supported')
        criteria = case.get('criteria', [])
        require(criteria and len({c['id'] for c in criteria}) == len(criteria), 'Missing/duplicate rubric criteria')
        for criterion in criteria:
            require(bool(criterion.get('description')) and criterion.get('evidence_types') and set(criterion['evidence_types']) <= {'response', 'event', 'change', 'artifact', 'check'}, 'Rubric needs observable evidence types')
        for check in case.get('checks', []):
            require(check['argv'] and all(isinstance(s, str) for s in check['argv']) and 0 < check['timeout'] <= 30, 'Check must be an explicit bounded argv, never shell text')
    schema = read_json(SCHEMA_FILE)
    require(schema.get('$schema') == 'https://json-schema.org/draft/2020-12/schema', 'Record schema missing')
    examples = sorted((HERE / 'examples').glob('*/record.json'))
    for path in examples:
        require(grade(path.parent)['origin'] == 'synthetic', 'Committed examples must be explicitly synthetic')
    return {'validation': 'suite/fixtures/record-contract only', 'scenarios': len(cases), 'synthetic_example_records': len(examples), 'model_runs_executed': 0}


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('validate'); sub.add_parser('list')
    prepare_parser = sub.add_parser('prepare'); prepare_parser.add_argument('scenario'); prepare_parser.add_argument('--out', required=True, type=Path); prepare_parser.add_argument('--condition', choices=['with-skill', 'baseline'], required=True)
    capture_parser = sub.add_parser('capture'); capture_parser.add_argument('run', type=Path); capture_parser.add_argument('--response', type=Path, required=True); capture_parser.add_argument('--events', type=Path, required=True); capture_parser.add_argument('--origin', choices=['real', 'synthetic'], required=True); capture_parser.add_argument('--model', required=True); capture_parser.add_argument('--session-id', required=True); capture_parser.add_argument('--trace', choices=['complete', 'partial', 'none'], required=True); capture_parser.add_argument('--run-checks', action='store_true', help='execute the scenario-defined project checks, separately labelled evaluator evidence')
    grade_parser = sub.add_parser('grade'); grade_parser.add_argument('run', type=Path)
    report_parser = sub.add_parser('report'); report_parser.add_argument('runs', type=Path, nargs='+')
    args = parser.parse_args(argv)
    try:
        if args.action == 'validate': result = validate_suite()
        elif args.action == 'list': result = [{'id': case['id'], 'title': case['title'], 'mode': 'read-only' if case['policies']['read_only'] else 'implementation'} for case in load_suite()]
        elif args.action == 'prepare': result = prepare(args.scenario, args.out, args.condition)
        elif args.action == 'capture':
            record = capture(args.run, args.response, args.events, origin=args.origin, model=args.model, session_id=args.session_id, trace_completeness=args.trace, verify=args.run_checks)
            result = {'record': str(args.run / 'record.json'), 'changes': len(record['changes']), 'evaluator_checks': record['checks'], 'next': 'Review observations.json with evidence, then grade. Capture is not a model pass.'}
        elif args.action == 'grade': result = grade(args.run)
        else: result = report(args.runs)
        print(json.dumps(result, ensure_ascii=True, indent=2))
        if args.action == 'grade': return 0 if result['status'] == 'pass' else 1 if result['status'] == 'fail' else 2
        return 0
    except (EvalError, OSError, KeyError, TypeError) as error:
        print(f'EVALUATION ERROR: {error}', file=sys.stderr)
        return 3


if __name__ == '__main__':
    raise SystemExit(main())
