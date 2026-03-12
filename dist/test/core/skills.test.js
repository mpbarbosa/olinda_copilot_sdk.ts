"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const skills_js_1 = require("../../src/core/skills.js");
// ---------------------------------------------------------------------------
// loadSkillDirectories
// ---------------------------------------------------------------------------
describe('loadSkillDirectories', () => {
    it('returns an empty array for empty input', () => {
        expect((0, skills_js_1.loadSkillDirectories)([])).toEqual([]);
    });
    it('returns a single path unchanged', () => {
        expect((0, skills_js_1.loadSkillDirectories)(['./skills'])).toEqual(['./skills']);
    });
    it('deduplicates identical paths, keeping first occurrence', () => {
        const result = (0, skills_js_1.loadSkillDirectories)(['./skills', './skills', './extra']);
        expect(result).toEqual(['./skills', './extra']);
    });
    it('filters out empty strings', () => {
        expect((0, skills_js_1.loadSkillDirectories)(['', './skills', ''])).toEqual(['./skills']);
    });
    it('trims leading and trailing whitespace from each path', () => {
        expect((0, skills_js_1.loadSkillDirectories)(['  ./skills  ', './extra'])).toEqual(['./skills', './extra']);
    });
    it('trims before deduplication (whitespace-padded duplicates collapse)', () => {
        const result = (0, skills_js_1.loadSkillDirectories)(['./skills', '  ./skills  ']);
        expect(result).toEqual(['./skills']);
    });
    it('filters paths that are whitespace-only', () => {
        expect((0, skills_js_1.loadSkillDirectories)(['   ', '\t', './real'])).toEqual(['./real']);
    });
    it('preserves insertion order of unique paths', () => {
        const paths = ['./c', './a', './b'];
        expect((0, skills_js_1.loadSkillDirectories)(paths)).toEqual(['./c', './a', './b']);
    });
    it('does not mutate the input array', () => {
        const input = ['./a', './a'];
        const copy = [...input];
        (0, skills_js_1.loadSkillDirectories)(input);
        expect(input).toEqual(copy);
    });
    it('handles many duplicate paths efficiently', () => {
        const paths = Array.from({ length: 100 }, () => './skills');
        expect((0, skills_js_1.loadSkillDirectories)(paths)).toEqual(['./skills']);
    });
});
// ---------------------------------------------------------------------------
// SkillConfig (structural / type-level checks via runtime shape)
// ---------------------------------------------------------------------------
describe('SkillConfig shape', () => {
    it('accepts only a body field (name and description optional)', () => {
        const skill = { body: '# Review guidelines\nAlways check edge cases.' };
        expect(skill.body).toBeTruthy();
        expect(skill.name).toBeUndefined();
        expect(skill.description).toBeUndefined();
    });
    it('accepts all fields', () => {
        const skill = {
            name: 'code-review',
            description: 'Security-focused review skill',
            body: '# Security Review\nLook for injection vulnerabilities.',
        };
        expect(skill.name).toBe('code-review');
        expect(skill.description).toBe('Security-focused review skill');
        expect(skill.body).toContain('injection');
    });
});
// ---------------------------------------------------------------------------
// SkillSessionConfig (structural / type-level checks via runtime shape)
// ---------------------------------------------------------------------------
describe('SkillSessionConfig shape', () => {
    it('accepts only skillDirectories', () => {
        const config = { skillDirectories: ['./skills'] };
        expect(config.skillDirectories).toHaveLength(1);
        expect(config.disabledSkills).toBeUndefined();
    });
    it('accepts skillDirectories and disabledSkills', () => {
        const config = {
            skillDirectories: ['./skills/code-review', './skills/documentation'],
            disabledSkills: ['experimental-feature', 'deprecated-tool'],
        };
        expect(config.skillDirectories).toHaveLength(2);
        expect(config.disabledSkills).toEqual(['experimental-feature', 'deprecated-tool']);
    });
});
