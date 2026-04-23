---
name: validate-log-file
description: >
  Validate a single ai_workflow.js prompt-log file in two parts: the Prompt
  section and the Response section. Reports structural, completeness, template
  rendering, and quality issues for the given file. Use this skill when asked
  to check, inspect, or validate a specific workflow log file.
---

# validate-log-file

## Overview

`ai_workflow.js` writes one Markdown file per AI persona invocation under:

```text
.ai_workflow/logs/workflow_<YYYYMMDD_HHmmss>/prompts/step_<id>/
  <timestamp>_<seq>_<persona>.md
```

Each file contains two logical parts:

| Part | Markdown heading | What it contains |
|------|-----------------|-----------------|
| **Prompt** | `## Prompt` | The exact text sent to the AI model, wrapped in a fenced code block |
| **Response** | `## Response` | The exact text returned by the AI model, wrapped in a fenced code block |

A file header (lines before `## Prompt`) carries required metadata fields.

This skill validates **one file** provided by the user and reports every
issue found in both parts.

---

## Input

The user provides the absolute or repo-relative path to a single log file,
for example:

```
.ai_workflow/logs/workflow_20260326_094543/prompts/step_02/2026-03-26T12-46-13-637Z_0001_documentation_expert.md
```

If no path is supplied, ask the user to provide one before proceeding.

---

## Part 1 — Prompt validation

### 1.1 File exists and is readable

Verify the file exists. If it does not, report:

```
✗ File not found: <path>
```

and stop.

### 1.2 Header field presence

The file must open with a `# Prompt Log` heading followed by these bold-key
fields before the `## Prompt` section:

| Field | Pattern to match |
|-------|-----------------|
| Timestamp | `**Timestamp:**` |
| Persona | `**Persona:**` |
| Model | `**Model:**` |
| Project Version | `**Project Version:**` |

For each missing field report:

```
✗ [Header] Missing required field: <field name>
```

### 1.3 Header field values

| Field | Validation rule |
|-------|----------------|
| `**Timestamp:**` | Must be a valid ISO 8601 datetime (e.g. `2026-03-26T12:46:13.637Z`) |
| `**Persona:**` | Must be non-empty and contain only `[a-z0-9_]` characters |
| `**Model:**` | Must be non-empty |
| `**Project Version:**` | Must follow semver or semver-prerelease (`N.N.N` or `N.N.N-tag`) |

Report each violation as:

```
✗ [Header] <field name>: <reason>
```

### 1.4 Prompt section structure

1. The file must contain a `## Prompt` heading.
2. Directly after `## Prompt` there must be a fenced code block opened with
   ` ``` ` (optionally followed by a language tag) on its own line.
3. The opening fence must have a matching closing ` ``` ` fence.
4. The content between the fences must be non-empty (not only whitespace).

Report as:

```
✗ [Prompt] <description of problem>
```

### 1.5 Prompt content quality

These are **warnings** (prefixed `⚠`) rather than errors:

- Content is shorter than 50 characters (likely truncated or placeholder).
- Content contains the literal string `TODO` or `PLACEHOLDER`.

### 1.6 Prompt template rendering quality

`ai_workflow.js` builds prompts by substituting `{variable}` placeholders in
YAML templates. When a variable is not passed to the builder, its placeholder
is silently removed, often leaving visible rendering artefacts. Check for:

**a) Unresolved `{variable}` tokens**

Scan the prompt body for patterns matching `\{[a-z][a-z0-9_]*\}` (lower-case
curly-brace tokens). These are template variables that were never substituted.
Report each unique unresolved token as an error:

```
✗ [Prompt] Unresolved template variable: {<variable_name>}
```

**b) Empty-substitution double-space**

When a template variable is passed as an empty string, any surrounding text
closes up — for example `"If a {var} variable"` → `"If a  variable"`. Scan
for two or more consecutive spaces that are **not** at the start of a line
(i.e. not indentation). Report each occurrence as a warning:

```
⚠ [Prompt] Empty substitution artefact: double space near "<surrounding text excerpt>"
```

Provide up to 40 characters of context around the first double-space on each
offending line.

**c) Over-blank variable blocks**

When a block variable (e.g. a directory tree or file list) is substituted with
an empty string, it often leaves 3 or more consecutive blank lines. Scan for
runs of ≥3 blank lines inside the prompt body and report as a warning:

```
⚠ [Prompt] Possible empty block variable: <N> consecutive blank lines at line <L>
```

**d) Skipped-section signal in prompt**

Scan the prompt body for the phrase `"not provided"` or `"skipped —"`. These
indicate the prompt template itself uses a conditional note that instructs the
model to skip a section when a variable is absent. Report each occurrence as a
warning so the analyst knows the AI will skip that section:

```
⚠ [Prompt] Skip signal in prompt at line <L>: "<excerpt>"
```

### 1.7 Prompt task inventory

Count the numbered task items in the prompt body. These are lines matching
`^\s{0,6}\d+\.\s` (1–6 spaces of indent, digit, period, space). Store this
count as `task_count`. It will be used in check 2.4.

### 1.8 Context metadata cross-validation

When the prompt body contains a `**Context:**` block (a line that is exactly
`**Context:**`), extract each `- Field: value` entry that follows it (up to the
next blank line or next bold heading) and cross-validate against observable
project facts.

Derive the **project root** from the `- Project: <path> (<name>)` context
entry if present; otherwise use the repository root.

#### 1.8a Primary Language

Extract `- Primary Language: <lang>` from the Context block. Determine the
**expected** language by checking these files in the project root (in priority
order):

| Check | Expected primary language |
|-------|--------------------------|
| `.workflow-config.yaml` contains `primary_language:` | Use that value (authoritative override) |
| `tsconfig.json` is present | `typescript` |
| `pom.xml` is present | `java` |
| `requirements.txt`, `setup.py`, or `pyproject.toml` | `python` |
| `go.mod` is present | `go` |
| `Cargo.toml` is present | `rust` |
| `composer.json` is present | `php` |
| `package.json` only (no `tsconfig.json`) | `javascript` |

Use the `bash` tool to check for these files, e.g.:
```bash
ls <project-root>/tsconfig.json 2>/dev/null && \
  grep -m1 "primary_language" <project-root>/.workflow-config.yaml 2>/dev/null
```

If the **logged** value does not match the **expected** value, report as a
warning:

```
⚠ [Prompt] Context inaccuracy — Primary Language: logged "<logged>" but project signals "<expected>"
    → Likely cause: detectTechStack() camelCase alias (primaryLanguage) missing or overridden incorrectly.
```

If the context block does not include a `Primary Language` field, skip this
sub-check silently.

#### 1.8b Documentation file count

Extract `- Documentation files: <N> markdown files` from the Context block.
Count `.md` files in the project (excluding `node_modules/`, `dist/`,
`coverage/`, `.ai_workflow/`):

```bash
find <project-root> -name "*.md" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/coverage/*" \
  -not -path "*/.ai_workflow/*" | wc -l
```

If the live count differs from the logged `<N>` by **more than 2**, report a
warning:

```
⚠ [Prompt] Context inaccuracy — Documentation files: logged <N> but found <M> .md files on disk (±2 tolerance)
```

A tolerance of ±2 accounts for files created or deleted between the workflow
run and the current validation.

If the context block does not include a `Documentation files` field, skip this
sub-check silently.

---

## Part 2 — Response validation

### 2.1 Response section structure

1. The file must contain a `## Response` heading.
2. Directly after `## Response` there must be a fenced code block.
3. The fence must be closed.
4. The content between the fences must be non-empty.

Report as:

```
✗ [Response] <description of problem>
```

### 2.2 Response content quality

Warnings:

- Content is shorter than 50 characters (likely empty or boilerplate).
- Content contains only the word `null`, `undefined`, or is entirely
  whitespace inside the fence.
- Content contains the literal string `TODO` or `PLACEHOLDER`.

### 2.3 Response coherence check (best-effort)

Cross-check the persona recorded in the header against the response content:

| Persona keyword | Expected response characteristic |
|-----------------|----------------------------------|
| `documentation` | Should mention at least one `.md` file, heading, or docs section |
| `test` / `testing` | Should reference test names, assertions, or coverage percentages |
| `security` | Should reference a CVE, vulnerability class, OWASP term, or secret |
| `architecture` | Should reference a component, module, pattern name, or directory |
| `code` / `quality` | Should reference a function, class, lint rule, or smell |
| `version` / `sync` | Should reference a semver string or version field |
| `script` / `shell` | Should reference a `.sh` file, bash command, or script path |

If the response content does not meet the expected characteristic, emit a
warning:

```
⚠ [Response] Persona mismatch: response content does not appear to match persona "<persona>"
```

This is a heuristic check — false positives are possible. Do **not** fail
the file on this alone.

### 2.4 Response task coverage

Using the `task_count` from check 1.7:

1. Count the **headed sections** in the response body — lines starting with
   `###` or lines that contain `\d+\.\s+\*\*` (numbered bold headings), which
   are the typical response section styles.
2. If `task_count > 0` and the section count is less than **half** of
   `task_count`, emit a warning:

```
⚠ [Response] Low task coverage: prompt had <N> task(s) but response addresses ~<M> section(s)
```

This heuristic catches cases where the AI silently omitted large parts of the
analysis (e.g. because a required input variable was empty).

### 2.5 Response skip-signal detection

Scan the response body for phrases that indicate the AI explicitly skipped a
section due to missing data:

| Pattern to match (case-insensitive) | Meaning |
|-------------------------------------|---------|
| `skipped —` | AI declared a section skipped |
| `not provided` | AI noted a required input was absent |
| `cannot.*without` | AI refused a task citing missing context |
| `no.*evidence` | AI found no data to report on |
| `data boundary limits` | AI constrained itself to a scope note |

For each match, emit a warning:

```
⚠ [Response] Skip signal at line <L>: "<excerpt>" — AI skipped a task due to missing prompt data
```

Cross-reference with check 1.6d to confirm whether a corresponding skip
signal was present in the prompt. If the prompt had a skip signal and the
response echoes it, that is **expected behaviour** — note it rather than
alarming. If the response skips without a corresponding prompt signal, that is
more concerning and should be highlighted.

---

## Output format

Print a validation report to the console in this format:

```
Validating: <relative-or-absolute path>
────────────────────────────────────────────────────────

Part 1 — Prompt
  ✓ Header — Timestamp: 2026-03-26T12:46:13.637Z
  ✓ Header — Persona: documentation_expert
  ✓ Header — Model: gpt-4.1
  ✓ Header — Project Version: 0.12.13-alpha
  ✓ Prompt — fenced code block: present and closed (3102 chars, 5 task(s))
  ⚠ [Prompt] Context inaccuracy — Primary Language: logged "javascript" but project signals "typescript"
      → Likely cause: detectTechStack() camelCase alias (primaryLanguage) missing or overridden incorrectly.
  ⚠ [Prompt] Empty substitution artefact: double space near "If a  variable is provided"
  ⚠ [Prompt] Skip signal in prompt at line 51: "Structural validation skipped — directory_tree not provided."

Part 2 — Response
  ✓ Response — fenced code block: present and closed (3660 chars)
  ✓ Response — content: non-empty, coherent with persona "documentation_expert"
  ⚠ [Response] Skip signal at line 8: "Structural validation skipped — directory_tree not provided." — AI skipped a task due to missing prompt data
    → Expected: prompt had a matching skip signal at line 51 — this is expected behaviour.

────────────────────────────────────────────────────────
Result: PASS  (4 warning(s))
```

**Result line rules:**

| Condition | Result line |
|-----------|-------------|
| No errors, no warnings | `Result: PASS` |
| No errors, ≥1 warning | `Result: PASS (N warning(s))` |
| ≥1 error | `Result: FAIL (N error(s), M warning(s))` |

Exit with a non-zero status (conceptually) when the result is `FAIL`.

---

## Step-by-step execution

1. **Resolve the file path.** Accept the path exactly as provided; if
   relative, resolve it from the repository root.

2. **Read the file** with the `view` tool.

3. **Parse the header** (lines before `## Prompt`). Extract `# Prompt Log`
   and all `**Field:**` lines.

4. **Validate Part 1** — work through checks 1.2 → 1.8 in order, collecting
   findings. Record `task_count` from 1.7. For check 1.8, resolve the project
   root from the `- Project:` context field, then run the `bash` tool to inspect
   files on disk.

5. **Locate `## Prompt`** and extract the fenced code block content.

6. **Locate `## Response`** and extract the fenced code block content.

7. **Validate Part 2** — work through checks 2.1 → 2.5 in order, collecting
   findings. Cross-reference 2.5 skip signals against 1.6d skip signals.

8. **Print the report** as described in [Output format](#output-format).

---

## Edge cases

| Situation | Handling |
|-----------|---------|
| File has `## Prompt` but no opening fence | Report `✗ [Prompt] Missing opening fenced code block` |
| Opening fence is present but never closed | Report `✗ [Prompt] Unclosed fenced code block` |
| File ends before `## Response` | Report `✗ [Response] Section missing` |
| Multiple `## Response` headings | Use the first occurrence |
| File uses `~~~` fences instead of ` ``` ` | Treat as valid fences |
| Prompt has 0 numbered tasks | Skip check 2.4 (task_count = 0 means no numbered structure to compare) |
| Context block absent from prompt | Skip check 1.8 silently |
| `Primary Language` field absent from Context block | Skip check 1.8a silently |
| `Documentation files` field absent from Context block | Skip check 1.8b silently |
| `.workflow-config.yaml` has a `primary_language` override | Use it as the authoritative expected value in 1.8a |
| Project root path in Context block does not exist on disk | Report `⚠ [Prompt] Context — Project path not found: <path>`; skip 1.8 sub-checks |
| Response skip signal matches prompt skip signal | Note as expected behaviour, do not elevate to error |

---

## Related files

- `.ai_workflow/logs/` — log file tree
- `.github/skills/validate-logs/SKILL.md` — batch validator (whole run directory)
- `.github/SKILLS.md` — skills index for this project

