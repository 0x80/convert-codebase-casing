# Transform File Casing

Transform an entire JS/TS codebase from camel-case to kebab-case or snake-case,
including all code imports and exports, in a matter of seconds.

## Motivation

Many TS/JS repositories name their files literally after the things they export,
and because the Javascript standard uses camel-casing this is what is then used
on the filesystem.

Some, including me, view the filesystem as its own domain, and when you do,
there seems to be no obvious reason to use camel-casing. Also, NPM exported
module paths typically also do not use camel-casing.

It seems that camel-casing is harder to read, and more difficult to use
consistently in various situations (acronyms, multiple named exports, class vs
instance). Personally, I much prefer the simplicity and readability of
kebab-case and snake_case.

Those lower-case file names also do not suffer from potential conflicts that
case-insensitive file systems like MacOS can cause with version control systems
like Git.

It can be extremely tedious to change file casing afterwards, when inheriting a
codebase or joining an existing project, so most teams will not even consider
this.

This transform was designed to make the file-casing change trivial.

# Usage

Without installing any dependencies, you can execute the transform from the root
of your codebase by pointing it to your source folder like this:

`npx transform-codebase-casing ./src`

By default the transform goes from camel-case to kebab-case. If you would like
to use to snake-case instead, do this:

`npx transform-codebase-casing ./src --casing snake`

After it is finished there should be 3 Git commits added to your current branch.

It could be that the transform missed some cases, so at this point you will have
to check if things still compile and run, and possibly fix a few things
manually.

# Known issues

## Next.js page variables in paths

The transform currently also mutates variables in Next.js page file paths, which
it shouldn't. So you'll have to manually correct these.

# How it works

## Transforming Files

File transformations are done in two stages.

1. The first stage renames the files and adds a suffix to files that will look
   the same for a case-insensitive OS like MacOS. These changes are then
   committed to Git.
2. The second phase removes the suffixes and commits the changes to Git again.

This way Git tracks the file changes fully and doesn't get confused.

## Transforming Import and Export Statements

After the file transformation is done, a codemod is run on the AST of very file
to convert all imports and exports to use the new file paths.
