# Code Quality Control Guide

This repository requires explicit code quality control for boundary-heavy
changes: keep public APIs intentional, isolate SDK leakage, and preserve clear
review and validation gates.

## Source of Truth

Use [docs/CODE_QUALITY_CONTROL.md](../docs/CODE_QUALITY_CONTROL.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep wrapper modules focused on orchestration; move compatibility glue and
   pure mapping logic into narrow helpers when that improves clarity.
2. Prefer library-owned public types for Claude and Copilot surfaces unless a
   raw SDK type leak is explicit and justified.
3. Treat `src/claude/internal/` and similar internal helper modules as
   non-public adapter space; do not re-export them from `src/index.ts`.
4. Update docs and changelog when public exports or recommended usage change.
5. Use the repository validation commands as the final quality gate for
   substantive code changes.

## Review Heuristic

If a change leaves SDK quirks, naming, and compatibility workarounds visible in
the public API, the boundary is still too weak. Favor thinner adapters and
clearer library-owned language.
