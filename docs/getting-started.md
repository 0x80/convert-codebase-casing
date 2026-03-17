# Getting Started

## Why?

Many JS/TS repositories name their files literally after the things they export. Because JavaScript uses camelCase, this convention bleeds into the filesystem.

But the filesystem is its own domain. There is no obvious reason to use camelCase for filenames. Even NPM's own module path convention is kebab-case.

Arguments for switching:

- **Readability** — kebab-case and snake_case are easier to scan than camelCase
- **Consistency** — no more debating PascalCase vs camelCase for different file types
- **Safety** — lowercase filenames avoid case-sensitivity conflicts on macOS/Windows with Git

Manually converting an existing codebase is extremely tedious. This tool automates the bulk of the work.

## Prerequisites

- Node.js >= 22.6.0
- A Git repository with a clean working tree
- A `.gitignore` file at the location you run the command from

The tool reads `.gitignore` to determine which directories to skip (like `node_modules` and `dist`).

## Quick Start

Run directly with npx, no installation required:

```sh
npx convert-codebase-casing ./src
```

This converts all files in `./src` from camelCase to kebab-case and updates all import/export paths in your code.

To use snake_case instead:

```sh
npx convert-codebase-casing ./src --casing snake
```

After the tool finishes, three Git commits will be added to your current branch. Check that your code still compiles and runs, and fix any remaining issues manually.

::: warning
This tool handles many common cases, but casing conversion is a complex problem with edge cases. Please expect to make a few manual adjustments afterwards. See [Known Limitations](/limitations).
:::

## Monorepos

If you are converting a monorepo that has a complete `.gitignore` file for each package, it may be best to invoke the transform from the root of each package separately.

::: tip
Run the command from the directory that contains the `.gitignore` you want to use for determining which files to skip.
:::

See the [CLI Reference](/cli-reference) for all available options.
