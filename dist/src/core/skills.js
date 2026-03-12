"use strict";
/**
 * Skills Types & Utilities
 * @module core/skills
 * @description Typed configuration interfaces and utilities for Copilot Skills.
 * Skills are reusable prompt modules loaded from directories containing a `SKILL.md` file.
 * See the {@link https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md | Copilot SDK Skills documentation}.
 * @since 0.3.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSkillDirectories = loadSkillDirectories;
/**
 * Normalises and deduplicates a list of skill directory paths.
 *
 * Trims whitespace, removes empty strings, and eliminates duplicates while
 * preserving the original insertion order of unique paths. This is a pure
 * function: no filesystem access, no side effects, deterministic output.
 *
 * @param paths - Raw list of directory paths (may contain duplicates or blanks).
 * @returns Ordered, deduplicated array of non-empty path strings.
 * @since 0.3.1
 * @example
 * ```ts
 * loadSkillDirectories(['./skills', './skills', '', './extra'])
 * // → ['./skills', './extra']
 * ```
 */
function loadSkillDirectories(paths) {
    const seen = new Set();
    const result = [];
    for (const p of paths) {
        const trimmed = p.trim();
        if (!trimmed || seen.has(trimmed))
            continue;
        seen.add(trimmed);
        result.push(trimmed);
    }
    return result;
}
