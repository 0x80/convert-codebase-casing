# Supported Transforms

The codemod phase uses [jscodeshift](https://github.com/facebook/jscodeshift) to parse your code into an AST and transform all import and export paths. The following statement types are handled.

## ES module imports

```ts
import { MyComponent } from "./components/MyComponent";
// → import { MyComponent } from "./components/my-component";
```

## ES module exports

```ts
export { handler } from "./api/RequestHandler";
// → export { handler } from "./api/request-handler";
```

## Export all

```ts
export * from "./utils/DateHelpers";
// → export * from "./utils/date-helpers";
```

## Dynamic imports

```ts
const module = await import("./pages/UserProfile");
// → const module = await import("./pages/user-profile");
```

## CommonJS require

```ts
const utils = require("./lib/StringUtils");
// → const utils = require("./lib/string-utils");
```

## URL constructor

```ts
const url = new URL("./assets/MyFont.woff2", import.meta.url);
// → const url = new URL("./assets/my-font.woff2", import.meta.url);
```

## TypeScript import types

```ts
type Config = import("./config/AppConfig").Config;
// → type Config = import("./config/app-config").Config;
```

## Next.js dynamic imports

```ts
const Component = dynamic(() => import("./components/MyWidget"));
// → const Component = dynamic(() => import("./components/my-widget"));
```

::: warning
jscodeshift has difficulty detecting call expressions that are deeply nested. Some patterns like `dynamic(() => import(...))` inside more complex wrappers may not be detected. See [Known Limitations](/limitations#nested-call-expressions).
:::
