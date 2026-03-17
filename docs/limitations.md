# Known Limitations

## Nested call expressions

jscodeshift cannot reliably detect `import()` or `new URL()` when they are nested inside other call expressions. While top-level dynamic imports and URL constructors are handled, patterns like these may be missed:

```ts
const Lightbox = dynamic(() => import("~/components/Universal/Lightbox"), {
  ssr: false,
});
```

```ts
await fetch(new URL("./assets/fonts/Figtree-Medium.ttf", import.meta.url)).then(
  (res) => res.arrayBuffer(),
);
```

These cases will need to be updated manually after conversion.

## Non-code file imports

Only code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`) are processed by the AST transform. If you have import paths in other file types like CSS or SCSS, those will need to be corrected manually:

```css
/* This import path is not updated automatically */
@import "./components/UserProfile.module.css";
```

## JSDoc comments

Import paths inside JSDoc comments are not transformed because they are not part of the AST:

```ts
/**
 * @param {import("~/store/LoadInitialChartData").SummaryResult} result
 */
```

## Snake case in monorepos

When converting to snake_case, package folder names will also be converted. If your monorepo packages reference each other by name in `package.json` files, those references will need to be updated manually. You may also need to regenerate your lockfile.

If you import files from sub-paths inside shared packages, make sure the namespace prefix you use is included in the [recognized prefix list](/path-prefixes). The `@repo` and `@mono` prefixes are included by default.

## Non-empty directory collisions

If a directory contains files that are excluded from renaming (for example, a `dist/` folder that is gitignored), the directory itself may not be empty after renaming its children. On case-insensitive filesystems, this can cause a collision when the old and new directory names differ only in casing.

A workaround is to clear any ignored files from those directories before running the conversion.
