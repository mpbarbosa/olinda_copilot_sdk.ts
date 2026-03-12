/**
 * Skills Types & Utilities
 * @module core/skills
 * @description Typed configuration interfaces and utilities for Copilot Skills.
 * Skills are reusable prompt modules loaded from directories containing a `SKILL.md` file.
 * See the {@link https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md | Copilot SDK Skills documentation}.
 * @since 0.3.1
 */
/**
 * Metadata describing a single Copilot Skill.
 * Corresponds to the parsed front-matter / header of a `SKILL.md` file.
 *
 * @since 0.3.1
 */
export interface SkillConfig {
    /** Human-readable skill name. Defaults to the directory name when omitted. */
    name?: string;
    /** Short description of what the skill provides. */
    description?: string;
    /** The full markdown body of the skill's `SKILL.md`. */
    body: string;
}
/**
 * Session-level configuration for Copilot Skills.
 * Passed as part of `SessionConfig` when creating a session.
 *
 * @since 0.3.1
 * @example
 * ```ts
 * const skillConfig: SkillSessionConfig = {
 *   skillDirectories: ['./skills/code-review', './skills/documentation'],
 *   disabledSkills: ['experimental-feature'],
 * };
 * ```
 */
export interface SkillSessionConfig {
    /**
     * Directories to scan for skills.
     * Each directory may contain one or more subdirectories, each with a `SKILL.md`.
     */
    skillDirectories: string[];
    /**
     * Names of skills to suppress even if discovered in `skillDirectories`.
     * Matched against the directory name of each skill.
     */
    disabledSkills?: string[];
}
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
export declare function loadSkillDirectories(paths: string[]): string[];
