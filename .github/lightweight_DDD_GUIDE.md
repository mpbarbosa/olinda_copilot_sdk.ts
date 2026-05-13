# Lightweight DDD Guide

This repository uses Domain-Driven Design selectively: strengthen language,
boundaries, and policy modeling without adding heavyweight tactical DDD
ceremony to a thin SDK wrapper library.

## Source of Truth

Use [docs/lightweight_DDD_GUIDE.md](../docs/lightweight_DDD_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep ubiquitous language consistent around concepts such as `session`,
   `message`, `provider`, `tool`, `skill`, `hook`, `auth method`, and
   `log issue`.
2. Treat `src/core/`, `src/claude/`, `src/lib/`, and `src/utils/` as bounded
   contexts with clear responsibilities instead of as generic code buckets.
3. Keep policy-rich logic and invariants in narrow, reusable helpers instead of
   mixing them into transport, filesystem, process, or SDK lifecycle wiring.
4. Use explicit adapter boundaries so third-party SDK vocabulary does not leak
   unchecked into the library's public API.
5. Prefer value-style modeling for requests, responses, configs, and parsed
   results; do not introduce aggregates, repositories, or domain events unless
   the project gains real long-lived business state.
6. Let `src/lib/` orchestrate contexts when needed, but do not erase provider
   boundaries or force false abstraction across Copilot and Claude surfaces.

## Review Heuristic

If a change adds more architectural ceremony than domain clarity, it is
probably over-applying DDD for this repository. Favor clearer language,
stronger boundaries, and thinner adapters over extra layers.
