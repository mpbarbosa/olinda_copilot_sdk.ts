# High Cohesion Guide

High cohesion is a core design rule for `olinda_copilot_sdk.ts`.

This repository already separates concerns across stable layers:

- `src/core/` for stateful Copilot runtime clients and adapters
- `src/claude/` for Claude-specific clients and wrappers
- `src/lib/` for focused workflows built from lower-level pieces
- `src/utils/` for pure, deterministic helpers
- `src/index.ts` as a re-export barrel only

This guide explains how to keep that structure clear as the library grows.

## Goal

Each module, class, function, and document should have one clear
responsibility. Related behavior should stay together. Unrelated behavior
should be split into separate units with explicit boundaries.

## What High Cohesion Means

High cohesion means the parts inside a component naturally belong together and
support the same purpose.

A cohesive component is easy to describe in one sentence:

- "`CopilotClient` sends chat completion requests to the Copilot REST API."
- "`CopilotSdkWrapper` manages the Copilot CLI session lifecycle."
- "`stream.ts` parses SSE chunks into typed stream data."
- "`log_validator.ts` builds focused workflow-log review inputs."

If the best description needs repeated "and", the responsibility is probably
too broad.

## Why It Matters

1. It makes components easier to understand.
2. It keeps changes localized.
3. It improves reuse because responsibilities are explicit.
4. It makes testing and review simpler.
5. It reduces accidental coupling between unrelated concerns.

## High Cohesion and Code LLMs

High cohesion also improves the quality of LLM-assisted coding.

Code-focused models work best when the intent of a file, function, or document
is easy to infer from local context. In this repository, that means a model can
quickly see whether a change belongs in a pure utility, a stateful SDK wrapper,
or a higher-level workflow helper.

This does not replace normal engineering discipline. It means high cohesion is
useful twice: it helps humans reason about the system, and it helps code models
operate on the system more safely.

### Why LLMs Benefit

- Focused modules make intent clearer.
- Clear boundaries reduce hidden dependencies.
- Grouped related logic improves context retrieval.
- Localized responsibilities make refactoring safer.
- Single-purpose APIs make incorrect assumptions less likely.

### Where Low Cohesion Hurts LLMs

- Mixed responsibilities blur the real purpose of the code.
- Generic helper files encourage broad, imprecise edits.
- One change can affect several unrelated behaviors at once.
- The model may miss side effects because they are scattered across concerns.

## Required Rules

1. A file should center on one primary concern.
2. A function should do one job and expose one clear reason to change.
3. Stateless request shaping, parsing, and normalization belong in `src/utils/`
   or narrow typed helpers, not in session wrappers.
4. Session lifecycle orchestration belongs in wrapper modules such as
   `src/core/session_client.ts` or `src/claude/sdk_wrapper.ts`, not in generic
   utility files.
5. `src/lib/` modules may compose `core` and `utils`, but should still define
   one focused workflow each.
6. `src/index.ts` must remain a pure barrel with no implementation logic.
7. Documents should cover one topic and link to related guides instead of
   duplicating them.
8. Build outputs under `dist/` mirror source structure; do not treat them as a
   place for hand-written mixed responsibilities.

## Positive Signals

- File names match the responsibility they implement.
- Public APIs are small and intention-revealing.
- Helper functions directly support the file's main concern.
- A module's tests cluster around one behavior area.
- A document can be scanned quickly without shifting between unrelated topics.
- Changes to one behavior rarely require edits to distant, unrelated files.

## Warning Signs

- One file authenticates, performs HTTP I/O, parses responses, and formats
  consumer-facing output.
- A wrapper both manages session lifecycle and owns unrelated transformation
  helpers that could be pure utilities.
- `src/lib/` becomes a catch-all for unrelated automation rather than focused
  workflows.
- A document mixes tutorial, reference, architecture, troubleshooting, and
  release notes in one place.
- Naming becomes generic because the component does too many things.

## Applying Cohesion in This Repository

| Component type | Cohesive responsibility in this project |
| --- | --- |
| `src/core/` client | One Copilot integration concern such as REST transport, auth, hooks, tools, or session lifecycle |
| `src/claude/` client | One Claude integration concern such as Messages API transport or SDK lifecycle |
| `src/utils/` module | One pure transformation or message/stream helper area |
| `src/lib/` workflow helper | One higher-level automation task or validation workflow |
| `src/index.ts` | Re-export public symbols only |
| Test file | One behavior area or one module surface |
| Documentation file | One concept, workflow, or reference topic |

Keep new code and new documents in the narrowest layer that matches their real
job.

## Best Practices

### When Creating a New File

1. Define the single purpose before naming it.
2. Place pure logic in `src/utils/` when it has no runtime or process
   lifecycle concerns.
3. Keep SDK process management, transport wiring, and side effects in the
   appropriate client or wrapper module.
4. Prefer specific names over generic containers such as `helpers` or
   `manager`.

### When Creating Functions or Classes

1. Make inputs and outputs reflect one responsibility.
2. Separate policy decisions from transport or process details.
3. Avoid methods that fetch data, transform it, format it, and publish it in
   one pass.
4. Split behavior when callers need unrelated subsets of the API.
5. Prefer boundaries that let both humans and tools understand the purpose of a
   component from nearby context.

### When Writing Documentation

1. Keep one topic per document.
2. Use cross-references instead of repeating the same guidance across files.
3. Separate how-to guides, reference material, architecture notes, and
   checklists when they grow independently.
4. Name documents so readers can predict their contents without opening them.

## Refactoring for Higher Cohesion

When a component grows unclear or difficult to name, refactor around distinct
responsibilities.

1. List everything the component currently does.
2. Group behavior by the data it owns or the decision it makes.
3. Split unrelated groups into narrowly named modules or documents.
4. Leave composition in entry points and keep reusable rules in focused units.
5. Rename files and symbols so the single responsibility is obvious.
6. Re-check that each extracted piece can be described in one sentence.

## Review Heuristics

### One-Sentence Test

Can the component's purpose be described in one clear sentence without "and",
"also", or "plus"?

### Change-Impact Test

If one behavior changes, do unrelated parts need to change too? If yes,
cohesion is probably weak.

This matters even more in LLM-assisted work: low-impact, localized edits are
safer for automated or semi-automated code changes.

### Naming Test

If the best name is vague, the responsibility likely is too.

### Split Test

If the component can be split into two focused parts without awkward surgery, it
may already contain multiple responsibilities.

## Preferred Fixes

1. Extract unrelated responsibilities into narrowly named modules.
2. Keep composition in entry points and business rules in reusable library code.
3. Move formatting, transport, process control, and orchestration into their own
   layers.
4. Replace generic helper buckets with purpose-specific modules.
5. Split broad documents into focused guides with clear cross-links.

## Summary Checklist

- [ ] The file or document has one primary concern.
- [ ] The name matches the responsibility.
- [ ] Helpers support the same concern as the parent component.
- [ ] Side effects are separated from policy where practical.
- [ ] Unrelated behaviors are not hidden behind a generic API.
- [ ] The component passes the one-sentence test.
- [ ] The topic would still make sense if read in isolation.
- [ ] A reviewer or code-focused LLM could infer the component's purpose from
      its local context.
