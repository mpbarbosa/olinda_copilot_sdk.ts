/**
 * define-team skill
 *
 * Two-phase workflow:
 *   Phase 1 — assess the current project codebase and define a development team
 *             with job descriptions (role title, headcount, ownership, skills).
 *   Phase 2 — compare the team roles against the ai_workflow_core config files
 *             (project_kinds.yaml, prompt_roles.yaml, ai_prompts_project_kinds.yaml)
 *             and add any missing project-kind, specialist-role, or persona entries.
 *
 * Trigger phrases (any in the user prompt activates context injection):
 *   "define team", "assess team", "team roles", "team definition",
 *   "job description", "sync team", "sync prompts", "team prompts", "workflow config"
 */

import { joinSession } from "@github/copilot-sdk/extension";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Resolve paths relative to the extension file location:
//   extension.mjs  →  .github/extensions/define-team/
//   ../../..       →  project root (olinda_copilot_sdk.ts/)
//   ../../../../.. →  sibling directory (../ai_workflow_core/)
const PROJECT_ROOT       = resolve(__dirname, "../../..");
const WORKFLOW_CORE_PATH = join(PROJECT_ROOT, "..", "ai_workflow_core");
const WORKFLOW_CORE_CFG  = join(WORKFLOW_CORE_PATH, "config");

/** Read a file safely; return null on any error. */
function safeRead(path) {
	try { return existsSync(path) ? readFileSync(path, "utf8") : null; }
	catch { return null; }
}

/**
 * Walk a directory up to maxDepth levels deep and return indented lines.
 * Skips node_modules and dot-entries.
 */
function walkDir(dir, indent = 0, maxDepth = 2) {
	if (indent >= maxDepth || !existsSync(dir)) return [];
	const lines = [];
	for (const entry of readdirSync(dir).sort()) {
		if (entry === "node_modules" || entry.startsWith(".")) continue;
		const full = join(dir, entry);
		const isDir = statSync(full).isDirectory();
		lines.push(`${"  ".repeat(indent + 1)}${isDir ? `${entry}/` : entry}`);
		if (isDir) lines.push(...walkDir(full, indent + 1, maxDepth));
	}
	return lines;
}

/**
 * Extract YAML entry keys at the specified indentation level.
 * indent=0 → no leading spaces (ai_prompts_project_kinds.yaml)
 * indent=2 → 2-space indent (project_kinds.yaml, prompt_roles.yaml sub-keys)
 */
function extractKeys(yaml, indent = 0, exclude = ["schema_version", "metadata", "changelog"]) {
	const prefix = " ".repeat(indent);
	const pattern = indent === 0
		? /^([a-z][a-z0-9_]+):/gm
		: new RegExp(`^${prefix}([a-z][a-z0-9_]+):`, "gm");
	return [...yaml.matchAll(pattern)]
		.map(m => m[1])
		.filter(k => !exclude.includes(k));
}

const TRIGGER_PHRASES = [
	"define team", "assess team", "team roles", "team definition",
	"job description", "sync team", "sync prompts", "team prompts", "workflow config",
];

const session = await joinSession({
	tools: [
		// ── Tool 1 ──────────────────────────────────────────────────────────────
		{
			name: "define_team_get_project_structure",
			description:
				"Read the current project's package.json, key config files, " +
				"ROADMAP.md, CHANGELOG.md (truncated), and src/ / test/ directory trees. " +
				"Returns structured context for codebase assessment and team definition. " +
				"Call this first in Phase 1.",
			parameters: { type: "object", properties: {} },
			skipPermission: true,
			handler: async () => {
				const lines = [`## Project root: ${PROJECT_ROOT}`, ""];

				// package.json
				const rawPkg = safeRead(join(PROJECT_ROOT, "package.json"));
				if (rawPkg) {
					const p = JSON.parse(rawPkg);
					lines.push("### package.json");
					lines.push(`  name:        ${p.name}`);
					lines.push(`  version:     ${p.version}`);
					lines.push(`  description: ${p.description ?? "(none)"}`);
					lines.push(`  main:        ${p.main ?? "(none)"}`);
					lines.push(`  module:      ${p.module ?? "(none)"}`);
					lines.push(`  engines:     ${JSON.stringify(p.engines ?? {})}`);
					lines.push(`  private:     ${p.private ?? false}`);
					lines.push(`  dependencies (${Object.keys(p.dependencies ?? {}).length}):`);
					for (const [k, v] of Object.entries(p.dependencies ?? {}))
						lines.push(`    ${k}: ${v}`);
					lines.push(`  devDependencies (${Object.keys(p.devDependencies ?? {}).length}):`);
					for (const [k, v] of Object.entries(p.devDependencies ?? {}))
						lines.push(`    ${k}: ${v}`);
					lines.push(`  scripts: ${Object.keys(p.scripts ?? {}).join(", ")}`);
					lines.push("");
				}

				// Key file presence
				const keyFiles = [
					"ROADMAP.md", "CHANGELOG.md", "README.md",
					"tsconfig.json", "tsconfig.esm.json",
					"jest.config.js", "eslint.config.js",
				];
				lines.push("### Key files present:");
				for (const f of keyFiles)
					if (existsSync(join(PROJECT_ROOT, f))) lines.push(`  ✓ ${f}`);
				lines.push("");

				// src/ and test/ trees
				for (const subDir of ["src", "test"]) {
					const full = join(PROJECT_ROOT, subDir);
					if (existsSync(full)) {
						lines.push(`### ${subDir}/ tree:`);
						lines.push(...walkDir(full));
						lines.push("");
					}
				}

				// ROADMAP (first 4 000 chars)
				const roadmap = safeRead(join(PROJECT_ROOT, "ROADMAP.md"));
				if (roadmap) {
					lines.push("### ROADMAP.md (first 4 000 chars):");
					lines.push(roadmap.slice(0, 4000));
					lines.push("");
				}

				// CHANGELOG (first 1 500 chars)
				const changelog = safeRead(join(PROJECT_ROOT, "CHANGELOG.md"));
				if (changelog) {
					lines.push("### CHANGELOG.md (first 1 500 chars):");
					lines.push(changelog.slice(0, 1500));
				}

				return lines.join("\n");
			},
		},

		// ── Tool 2 ──────────────────────────────────────────────────────────────
		{
			name: "define_team_read_workflow_configs",
			description:
				"Read all three ai_workflow_core config files and return a structured inventory: " +
				"existing project kinds, existing specialist roles, and existing per-kind prompt sections. " +
				"Call this first in Phase 2 to identify gaps before proposing YAML additions.",
			parameters: { type: "object", properties: {} },
			skipPermission: true,
			handler: async () => {
				const kindsRaw   = safeRead(join(WORKFLOW_CORE_CFG, "project_kinds.yaml"));
				const rolesRaw   = safeRead(join(WORKFLOW_CORE_CFG, "prompt_roles.yaml"));
				const promptsRaw = safeRead(join(WORKFLOW_CORE_CFG, "ai_prompts_project_kinds.yaml"));

				if (!kindsRaw || !rolesRaw || !promptsRaw) {
					return [
						`ERROR: ai_workflow_core config not found.`,
						`Expected: ${WORKFLOW_CORE_CFG}`,
						`Ensure the ai_workflow_core repo is cloned as a sibling of this project.`,
						`Current sibling path checked: ${WORKFLOW_CORE_PATH}`,
					].join("\n");
				}

				const kinds   = extractKeys(kindsRaw, 2);
				const roles   = extractKeys(rolesRaw, 2);
				const prompts = extractKeys(promptsRaw, 0);

				return [
					`## ai_workflow_core config inventory`,
					`Config path: ${WORKFLOW_CORE_CFG}`,
					"",
					`### project_kinds.yaml — existing project kinds (${kinds.length}):`,
					...kinds.map(k => `  - ${k}`),
					"",
					`### prompt_roles.yaml — existing specialist roles (${roles.length}):`,
					...roles.map(k => `  - ${k}`),
					"",
					`### ai_prompts_project_kinds.yaml — existing prompt sections (${prompts.length}):`,
					...prompts.map(k => `  - ${k}`),
					"",
					"Use this inventory to find gaps. For any team role not already represented,",
					"add a new entry to prompt_roles.yaml and/or ai_prompts_project_kinds.yaml.",
					"For a project kind not yet present, add a full entry to project_kinds.yaml.",
				].join("\n");
			},
		},

		// ── Tool 3 ──────────────────────────────────────────────────────────────
		{
			name: "define_team_get_config_paths",
			description:
				"Return the absolute paths to each ai_workflow_core config file so the agent " +
				"can open and edit them directly using the view/edit tools.",
			parameters: { type: "object", properties: {} },
			skipPermission: true,
			handler: async () => [
				`project_kinds:   ${join(WORKFLOW_CORE_CFG, "project_kinds.yaml")}`,
				`prompt_roles:    ${join(WORKFLOW_CORE_CFG, "prompt_roles.yaml")}`,
				`prompts_by_kind: ${join(WORKFLOW_CORE_CFG, "ai_prompts_project_kinds.yaml")}`,
			].join("\n"),
		},
	],

	hooks: {
		onSessionStart: async (session) => {
			session.log(
				"define-team skill loaded.\n" +
				"Exposes 3 helper tools:\n" +
				"  • define_team_get_project_structure   — Phase 1: read codebase context\n" +
				"  • define_team_read_workflow_configs   — Phase 2: inventory ai_workflow_core configs\n" +
				"  • define_team_get_config_paths        — Phase 2: get file paths for editing\n\n" +
				"Trigger phrases: 'define team', 'assess team', 'team roles', 'job description',\n" +
				"'sync team', 'sync prompts', 'team prompts', 'workflow config'",
			);
		},

		onUserPromptSubmitted: async (session, { userPrompt }) => {
			const lower = userPrompt.toLowerCase();
			if (!TRIGGER_PHRASES.some(t => lower.includes(t))) return;

			session.log([
				"═══ define-team workflow context ═══",
				"",
				"PHASE 1 — Codebase Assessment & Team Definition",
				"  1. Call define_team_get_project_structure to read the project stack, directory layout,",
				"     ROADMAP, and CHANGELOG.",
				"  2. Analyse: language, runtime, build system, runtime dependencies, dev tooling,",
				"     architecture (src/ module layout), test coverage, key complexity hotspots.",
				"  3. Define 3–5 team members. For each, provide:",
				"       • Role title (e.g. 'SDK Core Engineer')",
				"       • Headcount (0.5 / 1 / 1–2)",
				"       • Owned modules / files",
				"       • Key responsibilities (bullet list)",
				"       • Required skills (language, domain, tooling)",
				"       • Seniority (senior IC / tech lead / part-time)",
				"",
				"PHASE 2 — Sync Team Roles to ai_workflow_core Configs",
				"  1. Call define_team_read_workflow_configs to inventory existing entries.",
				"  2. Call define_team_get_config_paths to get file paths.",
				"  3. For each team role not represented in prompt_roles.yaml,",
				"     add a new specialist role entry (role_prefix block).",
				"  4. For the project kind not present in project_kinds.yaml,",
				"     add a full kind entry (detection, validation, testing, build, ai_guidance).",
				"  5. For the project kind not covered in ai_prompts_project_kinds.yaml,",
				"     add a new section with personas: documentation_specialist, test_engineer,",
				"     code_reviewer, code_quality_auditor, plus role_ref entries for each",
				"     specialist role added in step 3.",
				"  6. Follow the existing YAML structure: bump schema_version, update metadata.changelog.",
				``,
				`ai_workflow_core config dir: ${WORKFLOW_CORE_CFG}`,
			].join("\n"));
		},
	},
});
