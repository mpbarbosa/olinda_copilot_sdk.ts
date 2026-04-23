# GitHub Copilot Skills

**Package:** `olinda_copilot_sdk.ts`
**Language:** TypeScript
**License:** ISC

---

## Overview

GitHub Copilot Skills are reusable, self-contained instruction sets under
`.github/skills/` that automate recurring engineering tasks for this repository.
Each skill is a directory containing a `SKILL.md` file that describes the task,
its parameters, and step-by-step execution instructions.

---

## Skills Index

| Skill | Purpose |
|-------|---------|
| [`analyze-prompt-part`](skills/analyze-prompt-part/SKILL.md) | Analyze a selected prompt section (part) from an ai_workflow.js prompt log |
| [`audit-and-fix`](skills/audit-and-fix/SKILL.md) | Orchestrate the full log-audit pipeline: validate-logs → fix-log-issues → purge-workflow-logs in one pass |
| [`copy-ts-to-project`](skills/copy-ts-to-project/SKILL.md) | Copy a TypeScript source file (and its related code, documentation, and tests) into any target repository |
| [`fix-preflight-log-issues`](skills/fix-preflight-log-issues/SKILL.md) | Analyze an ai_workflow.js preflight log, isolate real root-cause failures, and fix them in the owning repository |
| [`fix-log-issues`](skills/fix-log-issues/SKILL.md) | Consume the `.ai_workflow/plan.md` file produced by validate-logs and apply every confirmed fix |
| [`fix-prompt-response-issues`](skills/fix-prompt-response-issues/SKILL.md) | Read a prompt log response from ai_workflow.js and extract concrete actionable improvements |
| [`js-to-ts`](skills/js-to-ts/SKILL.md) | Convert a JavaScript file to TypeScript |
| [`next-roadmap-phase`](skills/next-roadmap-phase/SKILL.md) | Plan and implement the next application version milestone from the project roadmap |
| [`purge-workflow-logs`](skills/purge-workflow-logs/SKILL.md) | Delete all transient workflow artefacts under `.ai_workflow/` after an audit run |
| [`sync-version`](skills/sync-version/SKILL.md) | Read the canonical version from `package.json` and propagate it to all dependent files |
| [`sync-workflow-config`](skills/sync-workflow-config/SKILL.md) | Analyze `.workflow-config.yaml` against the actual codebase and sync any drift |
| [`update-bessa`](skills/update-bessa/SKILL.md) | Update the bessa_patterns.ts dependency to the latest (or a specified) release |
| [`update-guia`](skills/update-guia/SKILL.md) | Update the guia.js dependency to the latest (or a specified) release |
| [`update-ibira`](skills/update-ibira/SKILL.md) | Update the ibira.js dependency to the latest (or a specified) release |
| [`update-olinda-utils`](skills/update-olinda-utils/SKILL.md) | Update the olinda_utils.js dependency to the latest (or a specified) release |
| [`update-pajussara`](skills/update-pajussara/SKILL.md) | Update the pajussara_tui_comp dependency to the latest (or a specified) release |
| [`update-paraty-geocore`](skills/update-paraty-geocore/SKILL.md) | Update the paraty_geocore.js dependency to the latest (or a specified) release |
| [`update-submodules`](skills/update-submodules/SKILL.md) | Update all git submodule folders and sync them with the project |
| [`validate-log-file`](skills/validate-log-file/SKILL.md) | Validate a single ai_workflow.js prompt-log file (prompt + response sections) |
| [`validate-logs`](skills/validate-logs/SKILL.md) | Validate log files in `.ai_workflow/logs/` against the actual codebase and write `plan.md` |
| [`validate-node-modules`](skills/validate-node-modules/SKILL.md) | Audit npm dependencies for deprecation warnings and unsafe transitive dependencies |
| [`verify-workflow-efficacy`](skills/verify-workflow-efficacy/SKILL.md) | Assess the efficacy of the most recent ai_workflow.js execution |

---

## Usage

Invoke a skill by referencing it in a GitHub Copilot chat session:

```text
@github run the audit-and-fix skill
```

Or reference a specific skill file directly when asking Copilot to perform a task.
