# Convert Codebase Casing

Convert an entire JS/TS codebase from camelCase to kebab-case or snake_case,
including all code imports and exports, in a matter of seconds.

## Features

- Convert all files and folders, including assets
- Update import/export statements, require(), dynamic import(), and new URL()
- Preserve special files like `_app.tsx`, `README.md`, and route parameters
- Git-aware workflow with atomic commits for each phase

## Quick Start

```sh
npx convert-codebase-casing ./src
```

To use snake_case instead of kebab-case:

```sh
npx convert-codebase-casing ./src --casing snake
```

## Documentation

For full documentation visit
[convert-codebase-casing.codecompose.dev](https://convert-codebase-casing.codecompose.dev/).

## License

MIT
