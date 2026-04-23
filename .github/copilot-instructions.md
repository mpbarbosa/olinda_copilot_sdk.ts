# Copilot Instructions

> Durable, high-signal guidance for Copilot-assisted development in this repository. Focus on stable architecture, design principles, documentation sync, and validation. Link to authoritative docs for details.

---

## Purpose

This file provides concise, project-specific guidance to help Copilot make high-quality, context-aware edits for `olinda_copilot_sdk.ts`, a TypeScript wrapper library for the GitHub Copilot SDK.

---

## Architecture and Source Boundaries

Respect these stable source layers:
- `src/core/` – Foundational runtime helpers
- `src/lib/` – Reusable workflow domain logic
- `src/utils/` – Shared low-level utilities

Supporting workflow surfaces:
- `.workflow-config.yaml` – Project-local workflow configuration
- `.ai_workflow/` – Runtime artifacts, cache, and checkpoints

---

## Design Principles

- Prefer pure functions for business logic where practical.
- Keep I/O (filesystem, process, environment) at the boundaries.
- Reuse helpers and respect module boundaries.
- Keep documentation and public surfaces aligned with actual behavior.

---

## Documentation and Change Coordination

- Sync user-facing changes with `README.md` and reference docs.
- Update `docs/ARCHITECTURE.md` for architecture or layout changes.
- Align package exports and entry points with `package.json` and API docs.
- For details, link to authoritative docs rather than duplicating content.

---

## Validation Commands

For substantive code changes, always validate with:
- `npm run lint`
- `npm test`
- `npm run build`

Use narrower scripts from `package.json` only for intentionally scoped tasks.

---

## Authoritative References

Consult these documents for details:
- `README.md` – Project overview, installation, usage
- `docs/ARCHITECTURE.md` – Repository layout and architecture
- `CHANGELOG.md`, `CONTRIBUTING.md`, `ROADMAP.md`
- `package.json` – Package metadata, scripts, exports, and entry points

---

> Do not duplicate implementation status, inventories, installation, or migration details—link to the above docs instead.
