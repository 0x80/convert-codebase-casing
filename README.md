# Convert Codebase Casing

Convert an entire JS/TS codebase from camel-case to kebab-case or snake-case,
including all code imports and exports, in a matter of seconds.

> ⚠️ DISCLAIMER ⚠️ After converting a number of codebases I realize that this is
> actually a very complex problem and I can not anticipate every possible
> scenario. Do not expect this to cover everything fully, although you might be
> lucky. Please expect to make a few manual adjustments afterwards. See
> [known limitations](#known-limitations)

⚠️ There seems to be a bug with the codemod. Only run the command from the
directory that you would like to convert. So if you only want to convert your
`src` directory, run the command from there with `.` as the path argument. You
might also have to do a find/replace on resulting path imports, stripping the
`__tmp` suffix. But other than that things still seem to work.

## Motivation

Many TS/JS repositories name their files literally after the things they export,
and because the Javascript standard uses camel-casing this is what is then used
on the filesystem.

You could instead consider the filesystem its own domain, and if you think about
it there seems to be no obvious reason to use camel-casing for filenames. Even
the standard for NPM exported module paths is kebab-case.

I would argue that camel-casing is harder to read, and more difficult to use
consistently in various situations (acronyms, multiple named exports, class vs
instance). Since I became aware of this, I much prefer the simplicity and
readability of kebab-case and snake_case.

In addition, lower-case file names do not suffer from potential conflicts that
case-insensitive file systems like MacOS can cause with version control systems
like Git.

It can be extremely tedious and time-consuming to change file casing on an
already existing codebase, so when inheriting a codebase or joining an existing
project, most teams will not even consider this.

The aim of this module is to make file-casing conversion possible with a minimal
amount of suffering. It will attempt to convert both the files and the
import/export statements in the code as much as possible, but expect to make a
few manual adjustments afterwards because there are simply too many possible
variations to consider.

## Features

- Convert all files and folders, including assets
- Convert import and export statements including:
  - `import ... from`
  - `export ... from`
  - `import()`
  - `require(...)`
  - `new URL(...)`
- Preserve page route parameters (Next.js)
- Preserve files that start with underscore like `_app.tsx` (Next.js)
- Preserve file names that are all upper-case like `README.md`

## How it works

The conversion happens in 3 stages. After completing each stage, a the changes
are committed to Git.

1. Rename files, phase 1: Rename all files, but beware of files that will appear
   the same to case-insensitive file systems. A rename of
   `components/Common/View.tsx` to `components/common/view.tsx` would cause
   issues. So it is first renamed to `components/common__tmp/view__tmp.tsx`.
2. Rename files, phase 2: Strip all `__tmp` prefixes from files and folders.
3. Run a codemod on each file that uses the AST to rename all import and export
   statements.

## Usage

Run the process from a location that has a .gitignore file, since this is used
to determine what directories to ignore. If you convert a monorepo that has a
complete .gitignore file for each package, it might be best to invoke the
transform from the root of each package separately.

Without installing any dependencies, you can execute the conversion from the
root of your codebase by pointing it to your source folder like this:

`npx convert-codebase-casing ./src`

By default the conversion goes from camel-case to kebab-case. If you would like
to use to snake-case instead, do this:

`npx convert-codebase-casing ./src --casing snake`

After it is finished there should be 3 Git commits added to your current branch.

It could be that the conversion missed some cases, so at this point you will
have to check if things still compile and run, and possibly fix a few things
manually.

## Known Limitations

### Nested call expressions not found

It seems that jscodeshift (which is what the codemods are based on) has no way
to find call expressions that are nested. This means that while this code will
look for `import()` and `new URL()` they will not be detected in the following
cases.

```ts
const Lightbox = dynamic(() => import("~/components/Universal/Lightbox"), {
  ssr: false,
});
```

```ts
await fetch(
  new URL(`./../../assets/fonts/Figtree-Medium.ttf`, import.meta.url)
).then((res) => res.arrayBuffer());
```

### Imports in styling and other non-code files

The conversion targets all files, but only the import/export paths of code are
transformed, because this is done via an AST transform JS/TS code. This means
that if you have other files that use imports (like styling), those imports will
have to be manually corrected.

### Imports in JsDoc comments

Links in comments like the one below will not be converted

```ts
/**
 * Renders the legend subtitle text for the performance chart.
 *
 * @param {Object} props
 * @param {import("~/store/load-initial-chart-data").SummaryResult} props.summaryResult
 */
```

### Converting to snake-case

Technically you can convert a codebase to use snake_case even if it is not the
standard for Javascript modules, but this likely requires you to adjust a few
things manually. Namely, if you convert a monorepo, and your packages folders
are converted, then you will have to manually adjust your package.json files and
re-generate a lockfile.

If you import files from sub-paths inside your shared modules, make sure you add
the namespace identifier you use for your internal packages to the list of
targeted prefixes. The @repo and @mono prefixes are included by default.

### Non-empty directory name collision

If you have a directory in which not all files are targeted for renaming, for
example because it contains a folder named `dist` when the folder will never be
emptied and removed. This can create a naming collision if the old directory and
new directory name look the same to a case-insensitive operating system.

If your folder was first named Foo, the new name should be foo, but this can not
be created while Foo is still there.

A workaround could be to clear any ignored files from those directories before
running the conversion.
