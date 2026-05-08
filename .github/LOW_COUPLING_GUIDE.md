# Low Coupling Guide

This repository requires low-coupling changes: keep dependencies explicit,
stable, and routed through clear boundaries.

## Source of Truth

Use [docs/LOW_COUPLING_GUIDE.md](../docs/LOW_COUPLING_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Do not pull session-process wiring or SDK lifecycle concerns into
   `src/utils/`.
2. Let `src/lib/` compose lower-level modules, but do not make low-level
   modules depend back on workflow helpers.
3. Keep `src/core/` and `src/claude/` interfaces narrow so tests can stub only
   the dependency surface they need.
4. Prefer parameters, small interfaces, or scoped context over hidden shared
   state and broad object dependencies.
5. Keep construction and orchestration near entry points instead of inside pure
   business logic.
6. Cross-link related documentation instead of copying the same guidance into
   many places.

## Review Heuristic

If a file needs deep knowledge of several unrelated modules to do its job, the
dependency surface is probably too broad and should be reduced.
