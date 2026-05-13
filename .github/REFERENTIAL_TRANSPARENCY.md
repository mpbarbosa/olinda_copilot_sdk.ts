# Referential Transparency Guide

This repository requires referentially transparent changes where practical:
keep pure logic deterministic, explicit, and free of hidden state.

## Source of Truth

Use [docs/REFERENTIAL_TRANSPARENCY.md](../docs/REFERENTIAL_TRANSPARENCY.md) as
the authoritative guide. This `.github/` copy exists so workflow reviews and
Copilot-oriented guidance can discover the rule in the expected location
without duplicating the full document.

## Repository-Specific Rules

1. Keep `src/utils/` focused on pure helpers whose results depend only on their
   inputs.
2. Keep filesystem, process, network, environment, and SDK session access at
   runtime boundaries such as `src/core/`, `src/claude/`, and explicit workflow
   orchestration layers.
3. Pass volatile values like time, randomness, and configuration into helpers as
   parameters when deterministic behavior matters.
4. Do not mutate caller-owned arrays, objects, maps, or sets inside helpers;
   return new values instead.
5. Keep parsing, normalization, and request-shaping helpers side-effect free so
   they stay easy to test and reuse.
6. If a module must be impure, keep that impurity narrow and obvious instead of
   letting hidden state leak into reusable helpers.

## Review Heuristic

If a helper's result can change because of hidden state, ambient time, random
values, environment access, or mutation outside its parameters, it is probably
not referentially transparent enough for shared utility code.
