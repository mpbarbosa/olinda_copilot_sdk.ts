# High Cohesion Guide

This repository requires high-cohesion changes: keep each file, symbol, and
document focused on one clear responsibility.

## Source of Truth

Use [docs/HIGH_COHESION_GUIDE.md](../docs/HIGH_COHESION_GUIDE.md) as the
authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep `src/core/` focused on Copilot runtime concerns such as auth,
   transport, hooks, tools, and session lifecycle.
2. Keep `src/claude/` focused on Claude-specific clients and SDK lifecycle
   concerns.
3. Keep `src/lib/` focused on one workflow concern per module.
4. Keep `src/utils/` focused on pure, deterministic helpers with no process or
   session orchestration.
5. Keep `src/index.ts` as a pure re-export barrel with no implementation logic.
6. Keep each document focused on one topic and link to related guidance instead
   of copying large sections between files.

## Review Heuristic

If the best one-sentence description of a file or symbol needs repeated "and",
the responsibility is probably too broad and should be split.
