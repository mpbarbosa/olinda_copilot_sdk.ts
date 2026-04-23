---
name: js-to-ts
description: >
  Convert a JavaScript file to TypeScript. If {targetFile} ends with .js,
  rewrites it with full TypeScript types (interfaces, generics, return types,
  prop shapes), makes the code maximally reusable (named exports, extracted
  interfaces, generic helpers), and renames the file to .ts or .tsx. Updates
  all in-project import references to point to the new filename. Use this
  skill when asked to convert a JS file to TypeScript or to add types to a
  JavaScript source file.
parameters:
  targetFile:
    description: >
      Path to the JavaScript file to convert (absolute or relative to cwd).
      Must end with .js. If the file contains JSX, it will be renamed .tsx;
      otherwise .ts.
---

# js-to-ts

## Purpose

Convert a single `.js` file to TypeScript in place: add full static types,
improve reusability, rename the file, and patch all imports across the
project that referenced the old `.js` path.

---

## Step 0 — Guard clause

1. Confirm `{targetFile}` ends with `.js`. If it ends with `.ts` or `.tsx`,
   print:

   ```
   ✓ js-to-ts: {targetFile} is already TypeScript — nothing to do.
   ```

   and stop.

2. If `{targetFile}` does not exist, abort with:

   ```
   ✗ js-to-ts: file not found — {targetFile}
   ```

---

## Step 1 — Analyse the file

Read `{targetFile}` in full. Identify:

| Signal | How to detect |
|--------|---------------|
| **JSX present** | `React.createElement`, JSX tags (`<Component ...>`), `.jsx` usage |
| **React component** | Function/class returning JSX or calling `React.createElement` |
| **JSDoc types** | `@param`, `@returns`, `@type`, `@typedef`, inline `{Type}` annotations |
| **Existing prop shapes** | Comment blocks describing `props` object fields |
| **Default exports** | `export default` statements |
| **Named exports** | `export function / export const` statements |
| **External dependencies** | `import` statements — note whether types are available (`@types/*`) |

Determine the target extension:
- JSX present → `.tsx`
- No JSX → `.ts`

---

## Step 2 — Convert the code

Rewrite the file with these TypeScript rules applied. **Preserve all existing
logic, comments, and behaviour exactly — only add/adjust types and structure.**

### 2a — Type all function signatures

- Every function parameter must have an explicit TypeScript type.
- Every function must have an explicit return type.
- Convert JSDoc `@param {Type}` annotations into inline TypeScript types and
  remove the now-redundant `@param` tag (keep description prose as `/** */`
  comments if useful).
- Convert JSDoc `@returns {Type}` to a TypeScript return type annotation.

### 2b — Extract prop interfaces for React components

For every React component, define a named `Props` interface (or
`ComponentNameProps` if multiple components exist) **above** the component.
Replace the inline JSDoc comment block that described the props shape.

Example pattern:
```ts
export interface StepsPanelProps {
  steps: Record<string, StepEntry>;
  currentStepId: string | null;
  width: number;
  height?: number;
  selectedStepId?: string | null;
  onSelectStep?: (id: string) => void;
  isFocused?: boolean;
}
```

### 2c — Replace JSDoc utility types with TypeScript equivalents

| JSDoc | TypeScript |
|-------|------------|
| `Object.<string, T>` | `Record<string, T>` |
| `Array.<T>` | `T[]` |
| `?T` (nullable) | `T \| null` |
| `!T` (non-null) | `T` (drop annotation) |
| `*` | `unknown` |

### 2d — Type local variables

Add explicit type annotations to `const`/`let` declarations where TypeScript
cannot infer the type unambiguously (e.g., empty arrays, complex initial
values).

### 2e — Type external module imports

If an imported identifier lacks type information (no `@types` package), add a
minimal ambient `declare module` block or add a comment `// TODO: install @types/<pkg>`.

### 2f — Handle `import` path extensions

Change any local imports that end in `.js` (e.g., `import x from './foo.js'`)
to the TypeScript-compatible form (drop the extension or use `.js` per project
tsconfig — match the style already present in the file). If the project has no
preference, drop the extension.

---

## Step 3 — Maximise reusability

Apply the following reusability improvements **only where they add value**;
do not restructure code needlessly.

### 3a — Ensure named exports

Every public function and type must be reachable via a named export.

- If the file only has `export default`, add a named export alias:
  ```ts
  export { ComponentName };
  export default ComponentName;
  ```

### 3b — Extract shared types to the top of the file

All interfaces and type aliases must appear at the **top of the file**, after
imports and before any function definitions. This makes them easy to
re-export from barrel files.

### 3c — Make helpers generic where appropriate

If a helper function operates on a specific type solely because that was the
only caller, and it could trivially be made generic without breaking anything,
add a type parameter. Do not over-genericise — apply only when the generic
version is clearly simpler or more reusable.

### 3d — Rename identifiers to domain-agnostic names

Review every variable, function, parameter, and type name. Replace names that
are tightly coupled to a specific business domain, project, or application
context with generic, intention-revealing equivalents that communicate
**what** the identifier does rather than **where** it is used.

**When to rename:**
- The name embeds a product name, project codename, or team-specific jargon
  (e.g., `pajussaraStep` → `step`, `geocoreEntry` → `entry`)
- The name refers to a concrete entity in the original application that would
  confuse a consumer importing the module independently
  (e.g., `workflowLogPanel` → `listPanel`, `orchRunnerStatus` → `runStatus`)
- A generic algorithmic helper carries a domain-specific name
  (e.g., `filterPajussaraSteps` → `filterItems`, `buildGeocoreTree` → `buildTree`)

**When NOT to rename:**
- Names that already read as general-purpose (`items`, `index`, `label`, etc.)
- Names whose domain specificity is intentional and part of the public API
  contract (e.g., a library deliberately named after a concept)
- Third-party or framework identifiers (`React`, `useEffect`, `Box`, etc.)

**Process:**
1. List every identifier that fails the domain-agnostic test.
2. Propose a new name that preserves meaning without domain coupling.
3. Perform a **whole-file** rename (not just the declaration) — update every
   reference including JSDoc, comments, and string literals that reflect the
   identifier name.
4. If renaming would break a public API surface (exported symbol), keep the
   original name as a deprecated re-export alias and introduce the new name
   as the primary export:
   ```ts
   /** @deprecated Use `newName` instead */
   export { newName as oldName };
   export { newName };
   ```

### 3e — Add a `@module` JSDoc tag if absent

Ensure the file-level `@fileoverview` block (or add one if missing) contains:
```ts
/** @module <logical-module-path> */
```

---

## Step 4 — Rename the file

Delete the original `{targetFile}` and create the converted content at
`{targetFile}` with the `.js` extension replaced by `.ts` or `.tsx`.

Use the `create` tool for the new file and the `bash` tool to remove the
original:

```bash
git mv {targetFile} {targetFileTs}
```

Where `{targetFileTs}` = `{targetFile}` with `.js` → `.ts` (or `.tsx`).

---

## Step 5 — Patch import references

Search the entire project for any file that imports or requires `{targetFile}`
using its old `.js` path. Update those references to the new `.ts`/`.tsx`
filename (or drop the extension if the importing file uses extensionless
imports).

```bash
# Find all files that reference the old filename stem
grep -rl "<old-filename-stem>" . --include="*.ts" --include="*.tsx" \
  --include="*.js" --include="*.jsx" --include="*.mjs"
```

For each match, update the import path.

---

## Step 6 — Verify

Run a quick sanity check (only if the project already has a TypeScript build
or type-check script — do **not** install new tooling):

```bash
# If tsconfig.json exists:
npx tsc --noEmit 2>&1 | head -40
```

If type errors are reported, fix them before finishing. If no tsconfig exists,
skip this step and note it in the summary.

---

## Final summary

Print:

```
✓ js-to-ts complete
  Source:  {targetFile}
  Output:  {targetFileTs}
  Types added:
    • N function signatures typed
    • N interfaces extracted
    • N JSDoc annotations converted
  Reusability:
    • Named export ensured: yes/no
    • Types hoisted to top: yes/no
    • Generics added: N
  Import patches: N files updated
  TypeScript check: passed / skipped (no tsconfig)
```

---

## Notes

- **Never change runtime behaviour.** Only add types and structural
  improvements. If a conversion would require a logic change, add a
  `// TODO(js-to-ts): ...` comment and leave the original code intact.
- **Preserve all existing comments** unless they are replaced by equivalent
  TypeScript syntax (e.g., a JSDoc `@param` block that becomes an interface).
- **Do not add new dependencies.** If a type requires an external package,
  note it as a `TODO` comment.
- **Prefer `interface` over `type` alias** for object shapes unless union
  types or mapped types are needed.
- **Use `unknown` instead of `any`** for truly unknown values; use `any`
  only as a last resort and add a `// eslint-disable-next-line` comment.
