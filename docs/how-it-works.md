# How It Works

The conversion happens in three phases. After each phase, the changes are committed to Git automatically.

## Phase 1: Rename files (with temp suffix)

All files and directories are renamed to the target casing. However, on case-insensitive filesystems like macOS, renaming `Common` to `common` directly would fail because they are considered the same path.

To work around this, any segment where only the casing changes gets a temporary `__tmp` suffix:

```
components/Common/View.tsx → components/common__tmp/view__tmp.tsx
```

Files that already have the correct casing are left untouched.

## Phase 2: Remove temp suffixes

All `__tmp` suffixes are stripped from files and directories:

```
components/common__tmp/view__tmp.tsx → components/common/view.tsx
```

This two-phase rename strategy ensures the conversion works reliably on both case-sensitive and case-insensitive filesystems.

## Phase 3: Update code imports

A [jscodeshift](https://github.com/facebook/jscodeshift) codemod runs over all code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`) and transforms import/export paths in the AST.

Only paths that start with a [recognized prefix](/path-prefixes) are transformed. External package imports like `react` or `lodash` are left unchanged.

See [Supported Transforms](/supported-transforms) for the full list of statement types that are handled.

## Preserved files

Certain files are intentionally left unchanged:

- **Underscore-prefixed files** like `_app.tsx` and `_document.tsx` (Next.js conventions)
- **All-uppercase files** like `README.md`, `LICENSE`, and `CHANGELOG`
- **Bracketed route parameters** like `[id].tsx` and `[...slug].tsx` (Next.js dynamic routes)

## Casing functions

**kebab-case** inserts hyphens at camelCase boundaries and converts underscores and spaces to hyphens:

```
MyComponent   → my-component
camelCase     → camel-case
XMLParser     → xmlparser
```

**snake_case** inserts underscores at camelCase boundaries and converts hyphens and spaces to underscores:

```
MyComponent   → my_component
camelCase     → camel_case
XMLParser     → xmlparser
```
