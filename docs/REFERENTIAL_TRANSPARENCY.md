# Referential Transparency Guide

**Document version:** `0.10.0`

Referential transparency is a core design rule for `olinda_copilot_sdk.ts`.

This library is easier to evolve when shared logic is deterministic and keeps
side effects at explicit boundaries:

- `src/utils/` should stay pure and input-driven
- transport, SDK lifecycle, and process wiring belong in runtime-facing layers
- workflow orchestration may call impure boundaries, but should keep pure
  transformation steps isolated
- documentation should describe where purity is expected and where impurity is
  intentional

This guide explains how to preserve those boundaries.

## Goal

Modules, classes, functions, and documents should make it obvious whether they
are pure or effectful. Shared helpers should behave like stable transformations:
the same input should produce the same output, and calling them should not
mutate external state or trigger hidden work.

## What Referential Transparency Means

A referentially transparent expression can be replaced with its resulting value
without changing program behavior.

In practice for this repository, that means a helper is referentially
transparent when it:

1. Returns the same result for the same input.
2. Does not depend on hidden mutable state.
3. Does not mutate caller-owned data.
4. Does not perform I/O, process control, network access, or SDK session work.

Examples of cohesive, referentially transparent responsibilities in this codebase:

- "`stream.ts` parses input chunks into typed values."
- "`message_normalizer.ts` reshapes request data without sending it."
- "`src/index.ts` re-exports symbols without runtime behavior."

If a helper needs the clock, randomness, environment variables, a filesystem
read, or a live session handle to do its job, it is probably not referentially
transparent and should live at a boundary layer instead.

## Why It Matters

1. It makes helpers easier to reason about because behavior is local and stable.
2. It keeps tests narrow because pure logic does not need environment setup.
3. It reduces incidental coupling between shared utilities and runtime state.
4. It makes refactoring safer because calculations can be moved without changing
   behavior.
5. It helps reviewers spot where side effects are intended versus accidental.

## Referential Transparency and Code LLMs

Referential transparency also improves the quality of LLM-assisted coding.

Code-focused models work better when reusable logic is deterministic and hidden
dependencies are minimized. In this repository, that means a model should be
able to tell from local context whether code is a pure transformation, a
runtime boundary, or orchestration that composes both.

This does not replace normal engineering discipline. It means referential
transparency is useful twice: it helps humans reason about behavior, and it
helps code models avoid accidental side effects.

### Why LLMs Benefit

- Deterministic helpers are easier to infer from local context.
- Hidden state is less likely to be missed during edits.
- Pure transformations are safer to extract, reuse, and test.
- Narrow effect boundaries make ownership of side effects clearer.
- Stable helpers reduce the chance of speculative, cross-cutting changes.

### Where Non-Transparent Code Hurts LLMs

- Ambient state makes identical-looking calls behave differently.
- Mutation can create distant, non-obvious breakage.
- I/O hidden inside helpers blurs architecture boundaries.
- Mixed pure and impure responsibilities make edits harder to localize.

## Required Rules

1. Keep `src/utils/` limited to pure, deterministic helpers.
2. Keep filesystem, process, environment, network, and SDK session access in
   explicit boundary modules such as `src/core/`, `src/claude/`, or focused
   orchestration helpers in `src/lib/`.
3. Pass volatile inputs such as time, randomness, locale, or configuration into
   helpers explicitly when they influence results.
4. Do not mutate caller-provided arrays, objects, maps, or sets in shared
   helpers; return new values instead.
5. Keep parsing, normalization, validation, and request-shaping code free of
   observable side effects.
6. If a function must be impure, name and place it so the side effect is obvious
   from local context.
7. Do not hide environment access behind seemingly pure helper names.
8. Prefer composing pure helpers around a thin impure shell over mixing both
   concerns in the same function.

## Design Heuristics

Use these checks when deciding where code belongs:

### Good signs

- The function can be tested with only input and expected output.
- The function does not read ambient globals to decide its result.
- The function returns a new value instead of mutating shared state.
- The module can be reused without bringing along process or SDK machinery.

### Warning signs

- A helper calls `Date.now()`, `Math.random()`, or reads `process.env` directly.
- A "formatter" or "normalizer" writes files, logs, or updates shared objects.
- A supposedly reusable helper needs a live session, client, or network handle.
- A utility function both transforms data and performs orchestration.

## Repository-Specific Placement

Use referential transparency to keep architecture boundaries clear:

- Put pure data shaping, parsing, and normalization in `src/utils/` or narrow
  pure helpers close to the consuming module.
- Put API calls, session lifecycle work, process management, and environment
  reads in `src/core/` or `src/claude/`.
- Let `src/lib/` compose pure and impure pieces, but keep each step's role
  obvious.
- Keep `src/index.ts` as a re-export barrel with no hidden runtime work.

## Review Heuristic

If a helper's result can change because of hidden state, ambient time, random
values, environment access, or mutation outside its parameters, it is probably
not referentially transparent enough for shared utility code.

If the code must stay impure, move it to a boundary module and keep the pure
transformation steps separate.
