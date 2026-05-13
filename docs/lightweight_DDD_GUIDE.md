# Domain-Driven Design Guide

**Document version:** `0.10.0`

Domain-Driven Design (DDD) is useful in `olinda_copilot_sdk.ts` when applied
selectively.

This repository is primarily a typed integration library around external SDKs
and APIs, not a business-domain-heavy product. That means the right fit is
lightweight DDD: use the parts that sharpen terminology, boundaries, and
policies, and avoid heavy tactical ceremony that would mostly wrap transport
code.

This guide explains what DDD means for this project and where it should, and
should not, influence design.

## Goal

Use DDD to make the library's concepts clearer and easier to evolve without
turning a thin SDK wrapper into an over-modeled system.

In this repository, DDD should help answer questions such as:

1. What are the real concepts the library exposes?
2. Which rules belong to transport wrappers versus reusable domain logic?
3. Where should provider-specific details stop leaking into the public API?
4. When is a concept rich enough to deserve its own model instead of a loose
   bag of fields?

## What DDD Means in This Repository

For this project, DDD is mostly about:

1. **Ubiquitous language** — use stable, shared names for the concepts the
   library actually owns.
2. **Bounded contexts** — keep Copilot-specific, Claude-specific, workflow, and
   pure utility concerns separated.
3. **Value-oriented modeling** — represent request, response, config, auth, and
   issue concepts with precise types and invariants.
4. **Policy isolation** — keep reusable decision logic separate from transport,
   filesystem, process, and SDK lifecycle wiring.
5. **Anti-corruption boundaries** — adapt third-party SDK shapes instead of
   letting external vocabulary define the whole internal model.

For this project, DDD is usually **not** about:

1. Aggregates
2. Repositories
3. Domain events
4. Entity lifecycles
5. Persistence-centric modeling

Those patterns matter when the software owns complex business state over time.
This library mostly wraps external services, normalizes data, and orchestrates
runtime interactions.

## Why It Matters

1. It clarifies which concepts are part of the library's own public model.
2. It prevents third-party SDK details from leaking everywhere.
3. It keeps cross-provider behavior comparable without forcing false sameness.
4. It helps new features land in the right layer.
5. It improves maintainability for both human contributors and code-focused
   LLMs.

## DDD and Code LLMs

DDD helps code-focused models most when the domain language is narrow and
consistent.

In this repository, that means a model should be able to tell from local
context whether a file is about:

- Copilot transport and session behavior
- Claude transport and session behavior
- workflow-level review logic
- pure message, parsing, or normalization helpers
- the public API surface

Lightweight DDD improves LLM-assisted work because:

- stable terminology reduces ambiguous edits
- bounded contexts reduce cross-layer confusion
- well-named value types make invariants easier to preserve
- adapter boundaries reduce accidental leakage of third-party assumptions

## Ubiquitous Language

Use stable domain terms consistently across code, tests, and docs.

Core terms that already fit this project include:

| Term | Meaning in this project |
| --- | --- |
| session | A live conversational runtime managed through an SDK wrapper |
| message | A typed conversational turn sent to or received from a model |
| stream chunk | A partial incremental response unit from a streaming API |
| provider | The backing model platform or BYOK target |
| auth method | The strategy used to authenticate with Copilot or another provider |
| tool | A callable capability exposed to an agent session |
| skill | A packaged higher-level capability loaded into a session |
| hook | A lifecycle or permission interception point |
| log issue | A concrete actionable problem extracted from workflow logs |

When adding new features, prefer extending this vocabulary over inventing vague
names such as `manager`, `helper`, `engine`, or `handler` unless those names are
truly precise.

## Bounded Contexts in This Repository

This project already has natural bounded contexts:

| Context | Current home | Responsibility |
| --- | --- | --- |
| Copilot integration | `src/core/` | Copilot transport, auth, tools, hooks, MCP, session lifecycle |
| Claude integration | `src/claude/` | Claude transport, errors, and SDK lifecycle |
| Workflow support | `src/lib/` | Focused higher-level workflows built from lower-level parts |
| Pure shared logic | `src/utils/` | Deterministic parsing, shaping, and message utilities |
| Public API | `src/index.ts` | Public barrel and exported language of the library |

Treat these as semantic boundaries, not just folders.

For example:

1. Copilot session rules belong in `src/core/`, not generic utilities.
2. Claude-specific response parsing should stay in `src/claude/`, even when a
   similar idea exists in Copilot code.
3. `src/lib/` may compose contexts, but it should not erase their boundaries.
4. `src/utils/` should support contexts with pure helpers, not own provider
   runtime behavior.

## Tactical DDD Patterns That Fit

### Value Objects

Value-object thinking fits this repository well.

Good candidates include:

- message shapes
- auth resolution results
- session configuration values
- workflow log issues
- normalized response fragments

In practice, that means:

1. Prefer precise TypeScript interfaces and discriminated unions.
2. Encode invariants in constructors or factory helpers when practical.
3. Keep values immutable in spirit, even if represented as plain objects.
4. Avoid passing broad unstructured records when a named concept exists.

### Domain Services

Pure domain services also fit well when the library owns a non-trivial decision.

Examples:

- auth-priority resolution
- provider selection rules
- workflow log issue extraction
- request normalization or validation

These services should express policy, not runtime orchestration. If a function
needs filesystem access, process control, network access, or a live SDK session,
it is probably at an application or infrastructure boundary instead.

### Anti-Corruption Layers

This pattern is especially valuable here because the repository wraps external
SDKs.

Use adapter boundaries to:

1. translate third-party types into the library's public language
2. isolate provider-specific quirks
3. prevent SDK naming or shape changes from rippling across the codebase
4. keep public exports stable even when dependencies evolve

`CopilotSdkWrapper` and `ClaudeSdkWrapper` should remain adapters around external
systems, not dumping grounds for unrelated policy logic.

## Tactical DDD Patterns That Usually Do Not Fit

Avoid introducing these unless the project's core domain becomes much richer:

1. **Aggregates** — there is little internally owned mutable business state to
   guard with aggregate boundaries.
2. **Repositories** — most data comes from APIs, SDK sessions, or files, not a
   domain-owned persistence model.
3. **Domain events** — current workflows are direct and synchronous enough that
   event choreography would likely add indirection without clear value.
4. **Entities with identity** — most important concepts here are requests,
   responses, configs, and parsed results, which are better modeled as values.

If those patterns appear, they should solve a concrete complexity problem rather
than satisfy DDD vocabulary.

## Layering Guidance

If you map DDD ideas onto this repository, the layers should stay lightweight:

| Layer idea | What it means here |
| --- | --- |
| Domain | Pure concepts, invariants, and policy-rich helpers |
| Application | Workflow orchestration that coordinates domain logic and runtime clients |
| Infrastructure | HTTP calls, SDK clients, filesystem access, process control, environment access |

That maps roughly to:

- domain-oriented logic in `src/utils/` and narrow pure helpers near consuming modules
- application orchestration in `src/lib/`
- infrastructure adapters in `src/core/` and `src/claude/`

Do not force every file into a formal DDD layer if it makes the code harder to
read than the problem warrants.

## Decision Rules for New Code

When adding a feature, use these questions:

### Is this a domain concept or just transport wiring?

- If it expresses a reusable business-like rule or invariant, model it as a
  named type or pure helper.
- If it only forwards data to an SDK or API, keep it near the wrapper or
  transport layer.

### Does this concept belong to one bounded context?

- If yes, keep it there.
- If no, define a shared abstraction only when the shared language is real and
  stable, not merely similar.

### Are we modeling values or identities?

- Prefer value-style modeling unless the software truly owns long-lived mutable
  identity.

### Are external SDK terms leaking into public code?

- If yes, introduce or strengthen an adapter boundary.

## Warning Signs of Over-Applying DDD

1. New interfaces exist only to wrap one implementation with no real boundary.
2. Files are split into domain/application/infrastructure layers even though the
   behavior is a few straightforward functions.
3. Simple typed request/response objects are renamed as entities or aggregates
   without gaining useful invariants.
4. Reviewers need to understand architecture ceremony before they can understand
   the feature.
5. More code is dedicated to indirection than to the actual integration logic.

## Warning Signs of Under-Applying DDD

1. External SDK terminology dominates internal naming.
2. Similar concepts are named differently across Copilot, Claude, tests, and
   docs.
3. Provider-specific conditionals spread across unrelated files.
4. Policy logic and runtime side effects are mixed in the same large methods.
5. Public exports expose raw dependency shapes when the library should expose its
   own stable abstractions.

## Preferred Refactorings

When the design starts drifting, prefer these fixes:

1. Extract policy-rich logic from wrappers into focused pure helpers.
2. Rename types and functions to match the project's actual ubiquitous language.
3. Introduce explicit adapters where third-party concepts leak too far inward.
4. Split large modules by bounded context, not by vague technical buckets.
5. Promote repeated implicit concepts into named types when they carry stable
   meaning.

## Review Checklist

- [ ] The change uses the library's existing domain language.
- [ ] The feature belongs to a clear bounded context.
- [ ] Provider-specific details stay near adapter boundaries.
- [ ] Pure policy logic is not tangled with transport or process wiring.
- [ ] New abstractions solve real complexity rather than adding ceremony.
- [ ] Value-like concepts are modeled as precise types.
- [ ] Public exports reflect the library's own concepts, not just raw dependency
      shapes.

## Summary

DDD is worth using in `olinda_copilot_sdk.ts` as a **lightweight design guide**,
not as a full architectural template.

Use it to strengthen language, boundaries, values, and adapter layers. Do not
force heavy tactical DDD patterns into a project whose main job is to provide
typed wrappers, focused workflows, and clean integration surfaces.
