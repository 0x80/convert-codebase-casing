import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "codemods/transform-import-export-kebab":
      "src/codemods/transform-import-export-kebab.ts",
    "codemods/transform-import-export-snake":
      "src/codemods/transform-import-export-snake.ts",
    "transform-bin": "src/transform-bin.ts",
  },
  format: ["esm", "cjs"],
  target: "node18",
  shims: true,
  clean: true,
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
