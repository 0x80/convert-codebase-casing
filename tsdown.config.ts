import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    main: "src/main.ts",
    "codemods/convert-import-export-kebab":
      "src/codemods/convert-import-export-kebab.ts",
    "codemods/convert-import-export-snake":
      "src/codemods/convert-import-export-snake.ts",
  },
  format: ["esm"],
  target: "node20",
  sourcemap: true,
  dts: true,
  clean: true,
});
