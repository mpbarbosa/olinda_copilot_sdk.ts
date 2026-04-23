---
name: fix-preflight-log-issues
description: >
  Read an ai_workflow.js preflight log file, identify the real root-cause
  errors, verify them against the live repository, and fix the confirmed issues.
  Use this skill when a workflow preflight step fails and the evidence is in a
  plaintext log such as .ai_workflow/logs/workflow_*/preflight/*.log.
parameters:
  project_root:
    description: >
      Root directory of the repository to modify. Defaults to the current
      GitHub Copilot CLI working directory.
    default: $PWD
  preflight_log_path:
    description: >
      Absolute or repo-relative path to the plaintext preflight log file to
      analyze and fix.
---

# fix-preflight-log-issues

## Purpose

This skill turns a failed `ai_workflow.js` preflight transcript into a targeted
repair workflow:

1. Read one plaintext preflight log file
1. Separate root causes from duplicate and downstream noise
1. Verify each claimed failure against the live repository
1. Fix every confirmed issue in the owning project
1. Re-run the failing command until the original preflight failure is resolved

Use this skill for logs like:

```text
$project_root/.ai_workflow/logs/workflow_<YYYYMMDD_HHmmss>/preflight/test.log
```

Example:

```text
/home/mpb/Documents/GitHub/olinda_copilot_sdk.ts/.ai_workflow/logs/workflow_20260423_114203/preflight/test.log
```

## Preconditions

- `preflight_log_path` must point to an existing readable file.
- If the path is missing, ask the user for it before continuing.
- If the file does not exist, stop and reply with exactly:

```text
✗ Preflight log not found: <path>
```

## Log format assumptions

A preflight log is a plaintext command transcript, not a prompt/response
markdown file. Typical structure:

```text
Command: npm test
<raw stdout/stderr lines, often including ANSI color codes>
```

The log may contain:

- repeated stack traces for the same underlying problem
- TypeScript diagnostics
- Jest suite failures
- npm script wrappers
- coverage-threshold failures caused by earlier compile/runtime errors
- mixed stdout/stderr ordering

Treat it as noisy evidence, not as a one-line truth source.

## Root-cause analysis rules

### 1. Normalize first

Before extracting issues:

1. Strip ANSI color codes mentally or with tooling.
1. Ignore `PASS` lines unless they provide context for a later failure.
1. Capture the command from the leading `Command:` line when present. This is
   the authoritative repro command to re-run after fixing.

### 2. Extract candidate failures

Scan for concrete failure signals such as:

- `error TS####:`
- `Cannot find module`
- `FAIL <test file>`
- `Test suite failed to run`
- `ReferenceError`, `TypeError`, `SyntaxError`
- `npm ERR!`
- `Command failed`
- `No such file or directory`
- `Module not found`

Do not create separate issues for the same message repeated in a stack trace.

### 3. Collapse cascades into root causes

Cluster the log into the smallest set of independent actionable failures.

Treat these as **downstream noise** unless they still reproduce after the
underlying error is fixed:

- coverage threshold failures triggered because suites did not compile or run
- repeated `Cannot find module` stacks pointing to the same missing import
- multiple failing tests caused by one shared source-file error
- generic Jest summary lines that only restate an earlier diagnostic

Example:

```text
Cannot find module 'olinda_utils.js' from 'dist/src/core/logger.js'
```

followed by several integration test failures and coverage misses is **one**
root cause, not several.

### 4. Keep independent failures separate

If the log contains two unrelated causes, fix both. For example:

- a missing module import in `src/core/logger.ts`
- an invalid test import path in `test/core/session_types.test.ts`

These should be treated as separate issues even if they appear in the same run.

### 5. Verify before editing

Every candidate failure must be re-checked against the live repository:

- open the referenced file
- inspect the imported path, symbol, or command
- run the narrowest existing validation command that reproduces the issue
- only edit code when the problem still exists now

If a logged issue no longer reproduces, skip it silently as historical noise.

## Fix workflow

1. Read the full preflight log, not just the first error block.
1. Build a short list of confirmed root causes with the file(s) involved.
1. Reproduce each issue with the narrowest existing command first.
   - Prefer `npm run validate` for TypeScript errors.
   - Prefer a focused Jest invocation for a single failing suite when possible.
   - Use the full original command after local fixes are in place.
1. Apply the minimum code or configuration change that resolves the verified
   root cause.
1. Update directly related documentation only when the fix changes documented
   behavior or setup requirements.
1. Re-run the original `Command:` from the log and confirm the preflight
   failure is gone.

## Fix heuristics by failure type

### Missing module / import resolution

Examples:

- `Cannot find module 'x'`
- `TS2307: Cannot find module 'x' or its corresponding type declarations`

Procedure:

1. Check whether the dependency should exist in `package.json`.
1. Check whether the import path or package name is misspelled, renamed, or
   missing from Jest/TypeScript resolution config.
1. If the package is a declared dependency but absent locally, run the
   appropriate existing install command so the workspace matches the manifest.
1. If the problem is code-level, fix the import or config with the minimum
   change.

### TypeScript diagnostics

Examples:

- `error TS2307`
- `error TS6133`
- `error TS7006`

Procedure:

1. Reproduce with `cd "$project_root" && npm run validate` when applicable.
1. Fix the named file and line with a type-safe change that matches project
   conventions.
1. Avoid `any`, broad casts, and speculative refactors.

### Jest runtime failures

Examples:

- `Test suite failed to run`
- `FAIL test/...`

Procedure:

1. Decide whether the failure originates in test code, source code, or built
   artifacts.
1. Fix the earliest real runtime error, not the summary footer.
1. If `dist/` artifacts are stale and this repository expects committed build
   output, run the existing build commands after fixing source files.

### Coverage threshold failures

Treat coverage failures as actionable **only if** the suites run successfully
and coverage is still below threshold after all compile/runtime issues are gone.

Do not chase coverage percentages caused by aborted test execution.

## Stop conditions

If the log contains no concrete, reproducible issue after verification, stop
and reply with exactly:

```text
No actionable issues found in preflight log.
```

## What not to do

- Do not treat repeated stack traces as separate issues.
- Do not fix summary noise before the earliest root cause.
- Do not make speculative improvements unrelated to the verified failures.
- Do not introduce new tooling when existing repository commands are enough.
- Do not stop after the first fixed error if the same preflight log proves a
  second independent root cause still exists.

## Related files

- `$project_root/.ai_workflow/logs/workflow_*/preflight/*.log` — source evidence
- `.github/SKILLS.md` — skills index
- `.github/skills/fix-prompt-response-issues/SKILL.md` — analogous
  prompt-response repair workflow
- `.github/skills/validate-log-file/SKILL.md` — related log inspection skill
