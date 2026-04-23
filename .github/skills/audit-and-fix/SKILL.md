---
name: audit-and-fix
description: >
  Orchestrate the full log-audit pipeline in a single pass: run
  verify-workflow-efficacy to confirm the ai_workflow.js run produced
  meaningful output, then run validate-logs to produce $project_root/.ai_workflow/plan.md,
  then immediately run fix-log-issues to apply every confirmed fix and update
  the project roadmap, then run purge-workflow-logs to clean up all transient
  artefacts. Use this skill when asked to audit and fix workflow logs
  end-to-end, or any time you want all steps executed without a manual
  handoff between them.
parameters:
  project_root:
    description: >
      Root directory of the project to operate on.
      Defaults to the current GitHub Copilot CLI working directory.
    default: $PWD
---

# audit-and-fix

## Overview

This skill is a thin coordinator that runs the four-step log-remediation
pipeline back-to-back:

```text
┌───────────────────────────────────────────────────────────────┐
│                       audit-and-fix                           │
│                                                               │
│  0. verify-workflow-efficacy ──►  efficacy report + gate      │
│                                      ▼                        │
│  1. validate-logs      ──►  $project_root/.ai_workflow/plan.md              │
│                                      ▼                        │
│  2. fix-log-issues     ──►  fixes applied + roadmap updated   │
│                                      ▼                        │
│  3. purge-workflow-logs ──►  logs/, backlog/, summaries/ gone │
└───────────────────────────────────────────────────────────────┘
```

It adds no new logic of its own. Every decision about what counts as a minor
issue, how to verify it, and how to fix it is governed by the individual
skill files. This skill only defines the execution order and the abort
conditions that apply when running them together.

## Prerequisites

- `$project_root/.ai_workflow/logs/` must exist and contain at least one workflow run
  directory. If it is empty or absent, abort with:

  ```
  ✗ audit-and-fix aborted — no workflow run directories found under
    $project_root/.ai_workflow/logs/. Run a workflow first, then retry.
  ```

## Execution order

### Phase 0 — verify-workflow-efficacy

Execute the full `verify-workflow-efficacy` skill as documented in
`.github/skills/verify-workflow-efficacy/SKILL.md`.

> **Note:** Pass `project_root` to the sub-skill.

**Expected outcome:** An efficacy report is printed to the console and the
run is classified as **High**, **Medium**, or **Low**.

**Abort condition (Low efficacy):** If the efficacy score is below 50
(classified **Low**), pause and ask the user to confirm before continuing.
If the user does not confirm, abort with:

```
✗ audit-and-fix aborted — workflow efficacy too low to proceed safely.
  Re-run ai_workflow.js or invoke audit-and-fix again to override.
```

**Continue condition (Medium or High):** Proceed automatically to Phase 1.
For Medium efficacy, print a caution notice:

```
⚠️ Proceeding with Medium efficacy — review validate-logs output carefully.
```

### Phase 1 — validate-logs

Execute the full `validate-logs` skill as documented in
`.github/skills/validate-logs/SKILL.md`.

> **Note:** Pass `project_root` to the sub-skill.

**Expected outcome:** `$project_root/.ai_workflow/plan.md` exists and contains one or more
issue blocks.

**Abort condition:** If `validate-logs` produces a `plan.md` with zero
issues (all candidates were already fixed or all were Critical/High), print
a success notice and stop — there is nothing for Phase 2 to do:

```
✓ audit-and-fix complete (no issues to fix)
  validate-logs found 0 confirmed minor issues.
  plan.md is empty — fix-log-issues skipped.
```

### Phase 2 — fix-log-issues

Execute the full `fix-log-issues` skill as documented in
`.github/skills/fix-log-issues/SKILL.md`.

> **Note:** Pass `project_root` to the sub-skill.

Read `$project_root/.ai_workflow/plan.md` (written in Phase 1) and process every `open`
issue.

**Expected outcome:** All issues are `done` or `skipped`, roadmap updated,
all commits pushed.

### Phase 3 — purge-workflow-logs

Execute the full `purge-workflow-logs` skill as documented in
`.github/skills/purge-workflow-logs/SKILL.md`.

> **Note:** Pass `project_root` to the sub-skill.

**Expected outcome:** `$project_root/.ai_workflow/logs/`, `$project_root/.ai_workflow/backlog/`, and
`$project_root/.ai_workflow/summaries/` are deleted. `plan.md` and all other `$project_root/.ai_workflow/`
content are retained.

**Note:** Phase 3 always runs after Phase 2 completes (or is skipped due to
zero issues). It is not skipped when Phase 2 finds nothing to fix — the logs
are stale regardless.

## Abort and resume behaviour

If execution is interrupted mid-phase (e.g., a fix fails verification):

- `plan.md` retains accurate statuses — issues touched so far are `done` or
  `in-progress`; untouched issues remain `open`.
- To resume, invoke `fix-log-issues` directly (not `audit-and-fix`) so
  Phases 0 and 1 are not re-run and the existing `plan.md` is not overwritten.
- Run `purge-workflow-logs` manually once `fix-log-issues` has finished.

## Final summary

Print a consolidated summary after all four phases complete:

```
✓ audit-and-fix complete
  Phase 0 — verify-workflow-efficacy: score N/100 (<classification>)
  Phase 1 — validate-logs:            N issue(s) written to plan.md
  Phase 2 — fix-log-issues:           N fixed  |  N skipped
  Phase 3 — purge-workflow-logs:      logs/, backlog/, summaries/ removed
  Roadmap updated: $project_root/ROADMAP.md
```

## Related files

- `.github/skills/verify-workflow-efficacy/SKILL.md` — Phase 0 skill
- `.github/skills/validate-logs/SKILL.md` — Phase 1 skill
- `.github/skills/fix-log-issues/SKILL.md` — Phase 2 skill
- `.github/skills/purge-workflow-logs/SKILL.md` — Phase 3 skill
- `$project_root/.ai_workflow/plan.md` — intermediate handoff artifact
- `$project_root/ROADMAP.md` — final roadmap destination
- `.github/SKILLS.md` — skills index for this project
