import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    main: "src/main.ts",
    "codemods/convert-import-export": "src/codemods/convert-import-export.ts",
  },
  format: ["esm"],
  target: "node20",
  sourcemap: true,
  dts: true,
  clean: true,
});
