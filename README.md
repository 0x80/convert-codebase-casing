# Convert Codebase Casing

Convert an entire JS/TS codebase from camel-case to kebab-case or snake-case,
including all code imports and exports, in a matter of seconds.

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

It can be extremely tedious to change file casing on an already existing
codebase, so when inheriting a codebase or joining an existing project, most
teams will not even consider this.

The aim of this module is to make file-casing conversion trivial, by converting
both the files and the import/export statements in the code.

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

## Known Issues
