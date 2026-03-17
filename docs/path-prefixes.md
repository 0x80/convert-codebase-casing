# Path Prefixes

The codemod only transforms import paths that start with a recognized prefix. This ensures that external package imports like `react`, `lodash`, or `@types/node` are left untouched.

## Recognized prefixes

| Prefix   | Description                           |
| -------- | ------------------------------------- |
| `./`     | Relative path (same directory)        |
| `../`    | Relative path (parent directory)      |
| `~/`     | Common alias for project root         |
| `@/`     | Common alias for source directory     |
| `@src`   | Source directory alias                 |
| `@repo`  | Monorepo package alias                |
| `@mono`  | Monorepo package alias                |
| `#`      | Node.js subpath imports               |

## What is not transformed

Any import path that does not start with one of the above prefixes is considered an external package and is left unchanged:

```ts
import React from "react";              // unchanged
import _ from "lodash";                  // unchanged
import type { FC } from "react";         // unchanged
import { z } from "@hono/zod-validator"; // unchanged
```

## Custom aliases

If your project uses a custom path alias that is not in the list above (for example, `@lib/`), those paths will not be transformed automatically. You would need to update those imports manually after conversion, or add the prefix to the source code before running the tool.

The prefix list is defined in `src/lib/config.ts`.
