---
name: verify-workflow-efficacy
description: >
  Assess the efficacy of the most recent ai_workflow.js execution by reading
  the structured log files under .ai_workflow/. Produces a concise efficacy
  report covering step completion, AI persona invocations, success rate,
  cache performance, and detected anomalies. Use this skill before auditing
  or fixing workflow logs to understand whether the run produced meaningful
  output worth acting on.
---

# verify-workflow-efficacy

## Overview

`ai_workflow.js` writes four categories of artefact for every run:

| Path | Content |
|------|---------|
| `.ai_workflow/backlog/<run>/step_*.md` | Step definitions — what was *planned* |
| `.ai_workflow/logs/<run>/prompts/**/*.md` | AI prompt+response pairs — what was *executed* |
| `.ai_workflow/summaries/<run>/workflow_summary.md` | Machine-generated summary with metrics |
| `.ai_workflow/commit_history.json` | Record of commits produced by the workflow |

This skill reads all four sources for the **most recent run** (highest
`workflow_<YYYYMMDD_HHmmss>` directory name) and produces an efficacy score
and report.

## Efficacy dimensions

| Dimension | What it measures | Source |
|-----------|-----------------|--------|
| **Step completion** | Steps executed ÷ steps planned | backlog vs prompts |
| **Step success rate** | Steps with `✅` status ÷ total executed | backlog `**Status:**` |
| **AI invocation depth** | Prompt files per step (coverage of multi-persona steps) | `prompts/**/*.md` count |
| **Cache hit rate** | Reported in the workflow summary | `workflow_summary.md` |
| **Anomaly density** | Lines containing `⚠`, `WARNING`, `error`, `failed` across all prompt responses | prompt `## Response` sections |
| **Duration reasonableness** | Total runtime vs step count (flags extremely short or stale runs) | `workflow_summary.md` |

## Step-by-step execution

### 1. Locate the most recent run

```bash
ls -1 .ai_workflow/logs/ | sort | tail -1
```

Assign the result to `<RUN_ID>` (e.g., `workflow_20260325_215945`).

If `.ai_workflow/logs/` is empty or absent, print:

```
✗ verify-workflow-efficacy: no workflow runs found under .ai_workflow/logs/
  Run ai_workflow.js first, then retry.
```

…and stop.

### 2. Count planned steps

```bash
ls .ai_workflow/backlog/<RUN_ID>/step_*.md | wc -l
```

Assign to `STEPS_PLANNED`.

### 3. Count executed steps

Count the distinct step IDs for which at least one prompt file exists:

```bash
ls .ai_workflow/logs/<RUN_ID>/prompts/ | wc -l
```

Assign to `STEPS_EXECUTED`.

### 4. Measure step success rate

Read each `.ai_workflow/backlog/<RUN_ID>/step_*.md` file.
Count files where the `**Status:**` line contains `✅` → `STEPS_OK`.
Count files where the `**Status:**` line contains `❌` or `FAILED` → `STEPS_FAILED`.

### 5. Count total AI prompt invocations

```bash
find .ai_workflow/logs/<RUN_ID>/prompts -name "*.md" | wc -l
```

Assign to `PROMPTS_TOTAL`.

### 6. Extract summary metrics

Read `.ai_workflow/summaries/<RUN_ID>/workflow_summary.md`.
Extract from the **Performance Metrics** table:
- `Total Duration` → `DURATION`
- `Success Rate` → `SUMMARY_SUCCESS_RATE`
- `Cache hit rate` from the Recommendations section (if present) → `CACHE_HIT_RATE`

### 7. Measure anomaly density

Search all prompt log `## Response` sections:

```bash
grep -rn -E "(⚠|WARNING|error|failed)" \
  .ai_workflow/logs/<RUN_ID>/prompts/ | wc -l
```

Assign to `ANOMALY_COUNT`.

### 8. Compute efficacy score

Apply the following formula (integer 0–100):

```
COMPLETION_SCORE  = min(STEPS_EXECUTED / STEPS_PLANNED, 1.0) × 40
SUCCESS_SCORE     = (STEPS_OK / max(STEPS_EXECUTED, 1))       × 30
INVOCATION_SCORE  = min(PROMPTS_TOTAL / max(STEPS_EXECUTED, 1) / 2, 1.0) × 20
ANOMALY_PENALTY   = min(ANOMALY_COUNT × 2, 10)
EFFICACY_SCORE    = round(COMPLETION_SCORE + SUCCESS_SCORE + INVOCATION_SCORE - ANOMALY_PENALTY)
```

| Score range | Classification |
|-------------|---------------|
| 80–100 | ✅ **High** — run produced solid, actionable output |
| 50–79  | ⚠️ **Medium** — run completed but with gaps or anomalies |
| 0–49   | ❌ **Low** — run was largely ineffective; output should be treated with caution |

### 9. Print the efficacy report

Output the following to the console (exact format):

```
══════════════════════════════════════════════════════
  Workflow Efficacy Report
  Run: <RUN_ID>
══════════════════════════════════════════════════════
  Steps planned:        <STEPS_PLANNED>
  Steps executed:       <STEPS_EXECUTED>
  Steps succeeded (✅): <STEPS_OK>
  Steps failed   (❌): <STEPS_FAILED>
  AI prompt files:      <PROMPTS_TOTAL>
  Anomalies detected:   <ANOMALY_COUNT>
  Reported success rate:<SUMMARY_SUCCESS_RATE>
  Cache hit rate:       <CACHE_HIT_RATE>
  Total duration:       <DURATION>
──────────────────────────────────────────────────────
  Efficacy score:       <EFFICACY_SCORE>/100  (<CLASSIFICATION>)
══════════════════════════════════════════════════════
```

### 10. Emit classification-specific guidance

**High (80–100):**
```
✅ Workflow output is reliable. Proceeding to log audit is recommended.
```

**Medium (50–79):**
```
⚠️ Workflow output is partially reliable.
   Anomalies or incomplete steps may affect audit quality.
   Review flagged items carefully in validate-logs.
```

**Low (0–49):**
```
❌ Workflow efficacy is LOW. The run produced limited useful output.
   Continuing the audit pipeline may surface false issues.
   Consider re-running ai_workflow.js before proceeding.
   To override and proceed anyway, confirm explicitly.
```

For **Low** classification when invoked as Phase 0 of `audit-and-fix`, the
pipeline **pauses and asks for confirmation** before proceeding to
`validate-logs`. If the user does not confirm, abort with:

```
✗ audit-and-fix aborted — workflow efficacy too low to proceed safely.
  Re-run ai_workflow.js or invoke audit-and-fix again to override.
```

## Stale run detection

If `DURATION` is `0s` **and** `STEPS_EXECUTED` is 0, the run is considered
**stale** (the summary was written but the workflow did not run meaningful
steps). Print an additional warning:

```
⚠️ Stale run detected: summary reports 0 steps and 0s duration.
   This run may have been aborted or produced no output.
```

## What this skill does NOT do

- Does not modify any files.
- Does not create or update `plan.md`.
- Does not fix any issues.
- Does not delete any logs.

## Related files

- `.ai_workflow/logs/` — prompt logs (primary evidence source)
- `.ai_workflow/backlog/` — step definitions (planned work)
- `.ai_workflow/summaries/` — machine-generated run summary
- `.ai_workflow/commit_history.json` — commit record
- `.github/skills/audit-and-fix/SKILL.md` — orchestrator that calls this skill as Phase 0
- `.github/skills/validate-logs/SKILL.md` — Phase 1 of audit-and-fix
- `.github/SKILLS.md` — skills index for this project
