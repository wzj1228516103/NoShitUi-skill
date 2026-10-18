# Skill behavior evaluations

These nine fixed tasks measure observable decisions and outcomes. They do not
score whether a response repeats the Skill's headings or keywords. Everything
runs without a model API: an operator uses an independent model session, saves
its response and actual tool trace, then reviews the evidence.

`validate` and the unit tests check the fixtures, record contract and grader.
They **do not run a model or establish a Skill pass rate**. Committed examples
are explicitly synthetic and always excluded from real outcome summaries.

## Tasks and evidence

| Scenario | What can actually fail |
| --- | --- |
| `discovery-readonly` | Reading a private project or changing files during general discovery |
| `existing-strategy` | Ignoring the existing MUI/theme/icons or proposing a competing full system |
| `legacy-table` | Treating a current-major snapshot as permission to migrate a v8 table |
| `restricted-redistribution` | Trusting an MIT badge over a supplied extra redistribution condition |
| `unverified-evidence` | Inventing a license/maintenance finding or treating HTTP 403 as confirmed death |
| `native-static` | Adding a framework for a bounded native dialog, or claiming unavailable browser checks |
| `implementation-checks` | Failing real combined filtering tests, modifying tests, or claiming checks not run |
| `svelte-peer-boundary` | Ignoring a supplied incompatible peer requirement or silently upgrading the project |
| `source-provenance` | Copying without an accurate revision/notice, replacing the existing notice convention |

All fixtures are original, small evaluation projects. Package versions and
`evidence/` files are controlled exercise inputs, **not installable project
templates, current package audits, or legal claims about real resources**.
Fictional sources use `.example.invalid`. The evaluator supplies the same fixed
offline evidence to both conditions. This suite does not measure live browsing.

## Run one independent session

From the repository root, validate the harness and prepare a fresh workspace
outside the repository. Never run the task against the checked-in fixtures.

```sh
python evals/run.py validate
python -m unittest discover -s evals -p 'test_*.py'
python evals/run.py list
python evals/run.py prepare implementation-checks --condition with-skill --out ../eval-runs/filter-skill-01
```

The output identifies `task.md`, `workspace/`, and the Skill attachment. Give a
fresh model session only the task, its workspace, and (for `with-skill`) the
specified root `SKILL.md`. Do not give it the rubric, synthetic examples, prior
results, or intended fix. Keep its writes inside that workspace. The prepare
command does not launch a model, attach a Skill, or prove that it was loaded.
Use exported tool evidence to confirm the actual session setup.

For `baseline`, prepare a separate run with `--condition baseline` and do not
attach or install this Skill. Hold model/version, tool access, fixture, task,
offline restriction and available time constant. Use independent fresh sessions
to avoid transferring an earlier solution. Record deviations. A single pair is
a diagnostic, not a statistically reliable effectiveness estimate.

Save the final response as UTF-8 text and normalize the actual exported tool
events to JSONL. For example, a single shell call can have both a read and an
execute operation:

```json
{"id":"t001","tool":"exec_command","command":"node test-orders.mjs","exit_code":0,"stdout":"Order status, combined search, empty result and input preservation passed.","operations":[{"action":"read","scope":"workspace","path":"test-orders.mjs"},{"action":"execute","scope":"workspace","path":"test-orders.mjs"}]}
```

Use `read`, `write`, `network`, and `execute` operations with `workspace`, `skill`,
`external`, or `other` scopes. Workspace paths are relative to the run workspace.
Only workspace `read` and `execute` operations may use `"path":"."` to represent
a root directory listing or execution from the project root. Workspace `write`
operations, fixture paths and artifact references still require a specific
relative path; `..`, absolute paths, backslashes and embedded dot segments are
not accepted. Reading `.` still counts as project inspection in discovery tasks.
A command reading several files needs those reads recorded, including implicit
reads relevant to a task boundary. A command using a service needs a network
operation. Preserve actual stdout/stderr or link the raw export in an artifact.
Do not infer behavior by searching command strings or response keywords.

Declare `--trace complete` only for a complete trace, `partial` when events are
missing, and `none` with an empty JSONL file when none was captured. A missing
trace can never prove that no project read or network operation occurred.
Normalized traces and human notes remain operator reports, not a sandbox audit;
the harness cannot detect an omitted tool event or authenticate a model label.

```sh
python evals/run.py capture ../eval-runs/filter-skill-01 --response ../exports/response.md --events ../exports/events.jsonl --origin real --model MODEL_AND_VERSION --session-id ACTUAL_SESSION_ID --trace complete --run-checks
```

`capture` records before/after SHA-256 manifests and added/modified/deleted
paths. The optional `--run-checks` executes the scenario's bounded, explicit
argv in the evaluated workspace (Node.js is needed for the two fixtures with
executable checks). These are independent **evaluator reruns**, never evidence that the
agent ran a test. Without them, the corresponding check is `not_observed`.
No shell interpolation, dependency installation or model/network API is used
by the harness. Project checks do execute the evaluated project code.

Manifests exclude `.git`, `node_modules`, `dist`, `.cache`, and `__pycache__`.
Those generated/dependency directories are not covered by file-scope claims.
Other symlinks are recorded without following them and fail the fixture policy.
Changes after capture invalidate the record until it is captured again.

## Review and grade

Fill `RUN/observations.json` after inspecting actual artifacts and logs. Each
scenario's rubric is in `suite.json`. Judge the behavior described, not phrasing.
Pass/fail requires a reviewer name, a concrete explanation, and existing evidence:

```json
{"criterion":"agent-ran-checks","status":"pass","reviewer":"reviewer-id","evidence":["event:t001"],"note":"The exported call runs the unchanged test file and its captured exit code is zero."}
```

Evidence references can be `response:L1-L3`, `event:t001`, `change:orders.js`,
`check:orders-tests`, or `artifact:workspace/orders.js`. Each rubric lists
permitted evidence types. A response saying “tests pass” is not tool evidence.
Do not mark “agent ran checks” passed using an evaluator check. For unseen
browser behavior, record `not_observed` or judge the honesty of a reported
limitation; source inspection alone does not establish an interaction passed.

```sh
python evals/run.py grade ../eval-runs/filter-skill-01
python evals/run.py report ../eval-runs/filter-skill-01 ../eval-runs/filter-baseline-01
```

The grader checks actual file differences, allowed scope, declared tool
operations, evaluator check results, and evidence-backed human observations.
It validates the bundle contract from `record.schema.json` plus cross-file
invariants; it is not a general-purpose JSON Schema engine. Evidence references
are checked for existence/type, not semantically judged by another model.

- `pass`: every required observation and automatic check is observed and passes.
- `fail`: at least one concrete policy, check, or reviewed criterion fails.
- `incomplete`: nothing has failed but required evidence/judgment is missing.
- CLI exits: `0` pass, `1` fail, `2` incomplete, `3` invalid record/command input.

`report` shows real outcome counts and scenario coverage by condition. Synthetic
runs are shown separately and excluded; incomplete runs stay visible. It does
not calculate a “Skill pass rate” or causal improvement. Compare matching tasks
and review failed traces before changing instructions. Keep raw actual runs
outside the repository; add only narrow, reviewed regression fixtures here.
Repackaging a saved run is not a new model sample: repeated run IDs or the same
real session/model/scenario/condition are rejected when reporting together.

## Maintainer validation

The harness requires Python 3.8 or newer. Local fixture/grader tests were
verified with Python 3.8.6; grading an existing record was also verified with
3.12.14. CI is configured for Python 3.12. Other versions have not been
separately verified. Node.js is also needed for the executable fixture checks,
as described above.

`python evals/run.py validate` and the unit tests are offline and safe for CI.
The intentionally broken `orders-tests` fixture must fail its original test;
that is its starting behavior, not a repository regression. Tests repair a
temporary copy to exercise the evaluator pipeline and label that record
synthetic. Never count a repaired fixture or synthetic grading test as model
performance. Historical records require the matching suite/fixture revision;
the digest prevents grading them against silently changed expectations.
