import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "codemods/transform-import-export":
      "src/codemods/transform-import-export.ts",
    "transform-files-bin": "src/transform-files-bin.ts",
    "transform-code-bin": "src/transform-code-bin.ts",
  },
  format: ["esm", "cjs"],
  target: "node18",
  shims: true,
  // sourcemap: true,
  // bundle: false,
  // dts: true,
  clean: true,
  // shims: true, // replaces use of import.meta
  /**
   * The bin files are ES modules. The file is required to have the `.mjs` file
   * extension, otherwise a non-ESM workspace will try to execute it as
   * commonJS.
   *
   * For details see [this article from Alex
   * Rauschmayer](https://exploringjs.com/nodejs-shell-scripting/ch_creating-shell-scripts.html
   */
  outExtension(ctx) {
    // console.log("ctx", ctx);
    if (ctx.format === "cjs") {
      return {
        js: `.cjs`,
      };
    } else {
      return {
        js: `.mjs`,
      };
    }
  },
});
