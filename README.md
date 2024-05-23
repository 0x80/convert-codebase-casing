# Transform File Casing

Transform an entire code repository to kebab-case including code import paths.
Currently only goes from camel-case to kebab-case.

# Usage

`pnpm add transform-file-case`

Then run

`npx transform-files ./src`

and later

`npx transform-code ./src`

# How it works

## Filename transform

File transformations are done in two stages. The first stage renames the files
and adds a suffix to files that will look the same for a case-insensitive OS
like MacOS.

These changes are then committed to GIT.

The second phase removes the suffixes and commits the changes to GIT again.

This way Git tracks the file changes fully and doesn't get confused.

## Import Transform
