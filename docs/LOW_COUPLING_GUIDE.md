# Low Coupling Guide

Low coupling is a core design rule for `olinda_copilot_sdk.ts`.

This library works best when dependencies stay explicit and flow through stable
boundaries:

- pure utilities do not depend on runtime session state
- workflow helpers compose lower-level modules instead of reaching across layers
- wrapper clients own SDK/process wiring so leaf modules stay independent
- documentation cross-links related guidance instead of copying it

This guide explains how to preserve those boundaries.

## Goal

Modules, classes, functions, documents, and scripts should depend on as few
other components, layers, global states, and implicit conventions as practical.
Dependencies should be explicit, stable, and routed through clear boundaries.

## What Low Coupling Means

Low coupling means a component can do its job without knowing unnecessary
details about how other components are implemented.

A loosely coupled component depends on collaborators through narrow,
well-defined contracts:

- "`stream.ts` parses SSE input without knowing who requested the stream."
- "`log_validator.ts` builds review context without owning SDK session wiring."
- "`src/index.ts` re-exports public symbols without depending on runtime state."

When a component needs deep knowledge of several unrelated modules, coupling is
probably too high.

## Why It Matters

1. It allows components to evolve independently.
2. It reduces the blast radius of changes.
3. It makes testing simpler because dependencies can be replaced or mocked.
4. It makes reuse easier across projects and contexts.
5. It keeps architecture boundaries visible and enforceable.

## Low Coupling and Code LLMs

Low coupling also improves the quality of LLM-assisted coding.

Code-focused models work better when dependencies are explicit and local effects
stay local. In this repository, that means a model should be able to see from a
file's imports whether it belongs to pure utility logic, transport code,
workflow orchestration, or the public export surface.

This does not replace normal engineering discipline. It means low coupling is
useful twice: it helps humans reason about dependency structure, and it helps
code models make safer edits with less guesswork.

### Why LLMs Benefit

- Explicit dependencies make call chains easier to follow.
- Stable interfaces reduce hidden assumptions.
- Localized impact makes edits safer.
- Reusable adapters and composition roots are easier to identify.
- Tests can substitute focused mocks instead of large environment setup.

### Where High Coupling Hurts LLMs

- Hidden dependencies are easy to miss.
- Global mutable state creates non-obvious side effects.
- Concrete implementation details leak into unrelated layers.
- One change may require synchronized edits across many files.

## Required Rules

1. Depend on the narrowest stable abstraction available.
2. Keep dependency direction aligned with the project architecture.
3. `src/utils/` must stay free of SDK session state, filesystem orchestration,
   and external process wiring.
4. `src/lib/` may compose `core`, `claude`, and `utils`, but should not force
   low-level modules to import back upward.
5. `src/index.ts` must remain a re-export barrel and must not become a
   construction or configuration hub.
6. Prefer dependency injection, parameters, or scoped context over hidden
   singleton lookups.
7. Centralize truly shared configuration instead of hardcoding repeated values
   across files.
8. Documents should reference related sources rather than copy large shared
   sections into many places.
9. Tests should not require broad fixture setup when only one focused dependency
   is needed.

## Positive Signals

- Dependencies are injected or imported for a clear reason.
- Public interfaces are small and stable.
- Call chains are easy to trace.
- A change in one module rarely forces edits in distant modules.
- Shared configuration has a single source of truth.
- Documents cross-reference related material instead of duplicating it.

## Warning Signs

- Utility modules import session wrappers or process-level SDK wiring.
- Classes instantiate their own collaborators deep inside core logic.
- Helpers know too much about callers, storage, transport, and presentation.
- Shared mutable state coordinates unrelated components.
- Hardcoded values appear in many places and must change together.
- Refactors require synchronized edits across many files with no clear boundary.
- A function accepts a large object but uses only a few fields.

## Applying Low Coupling in This Repository

| Component type | Low-coupling approach in this project |
| --- | --- |
| `src/core/` client | Isolate Copilot transport, auth, hooks, and session concerns behind focused APIs |
| `src/claude/` client | Keep Claude-specific transport and SDK lifecycle details within Claude modules |
| `src/utils/` module | Accept plain typed inputs and return plain typed outputs |
| `src/lib/` workflow helper | Compose lower-level modules without pulling low-level modules back into workflow concerns |
| `src/index.ts` | Export public symbols without owning runtime wiring |
| Test file | Mock or stub only the dependency surface needed for that behavior |
| Documentation file | Link to adjacent guides instead of duplicating shared explanations |

Keep dependencies flowing inward toward stable logic and keep wiring near the
top of the system.

## Best Practices

### When Creating a New File

1. Import only what the file truly needs.
2. Prefer small interfaces or typed collaborators over concrete, broad
   dependencies.
3. Avoid reading global state unless the file is explicitly responsible for
   process-wide coordination.
4. Centralize repeated configuration values instead of scattering them.

### When Creating Functions or Classes

1. Pass dependencies in rather than constructing them inside core logic.
2. Define minimal type or interface boundaries for collaborators.
3. Accept focused inputs instead of large "god objects."
4. Use factories or composition roots when production wiring is complex.
5. Prefer boundaries that let both humans and tools see what the component
   depends on from nearby context.

### When Writing Documentation

1. Keep shared guidance in one authoritative place.
2. Cross-link related guides instead of copying the same sections.
3. Separate reference material from process instructions when they evolve
   independently.
4. Keep each document self-contained enough to read, but not bloated with
   repeated content.

## Refactoring for Lower Coupling

When a component knows too much about the rest of the system, reduce dependency
surface deliberately.

1. List the modules, services, globals, and files it depends on.
2. Separate essential dependencies from convenience dependencies.
3. Introduce narrow interfaces at unstable boundaries.
4. Move wiring and object creation upward into entry points or factories.
5. Replace hidden shared state with explicit inputs, outputs, or scoped context.
6. Centralize repeated configuration and remove duplicated hardcoded values.
7. Re-check whether the component can be tested in isolation with simple mocks
   or stubs.

## Review Heuristics

### Dependency Trace Test

Can you follow what the component depends on without jumping through many files
or implicit globals?

### Change-Radius Test

If one collaborator changes, do many unrelated modules need coordinated edits?
If yes, coupling is probably too high.

This matters even more in LLM-assisted work: localized dependency changes are
much safer for automated or semi-automated edits.

### Replacement Test

Could you swap a dependency for a mock, stub, alternate implementation, or new
adapter without rewriting the caller?

### Construction Test

Does core logic construct its own collaborators, or is wiring kept near the
system boundary?

### Duplication Test

Are shared values, instructions, or dependency rules repeated in several places
instead of referenced from one source?

## Preferred Fixes

1. Introduce clear interfaces at layer boundaries.
2. Move composition to top-level orchestrators, factories, or entry points.
3. Replace hidden shared state with explicit inputs, outputs, or scoped context
   objects.
4. Split modules that both own logic and manage many external dependencies.
5. Centralize configuration that must stay consistent across files.
6. Replace repeated documentation blocks with focused source documents and
   cross-links.

## Summary Checklist

- [ ] The component depends on the narrowest stable abstraction available.
- [ ] Dependencies are explicit instead of hidden in globals or implicit setup.
- [ ] Core logic does not construct many collaborators directly.
- [ ] Shared values are centralized instead of hardcoded repeatedly.
- [ ] Dependency direction matches the intended architecture.
- [ ] The component can be tested with focused setup.
- [ ] Related documents reference each other instead of duplicating content.
- [ ] A reviewer or code-focused LLM could infer the component's key
      dependencies from its local context.
