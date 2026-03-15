import { describe, it, expect } from "vitest";
import { transformPath } from "./update-source-value";
import { getCasingFunction } from "../../lib/get-casing-function";

const toKebab = getCasingFunction("kebab");

describe("transformPath", () => {
  describe("recognizes target prefixes", () => {
    it("transforms relative ./ paths", () => {
      expect(transformPath("./MyComponent", toKebab)).toBe("./my-component");
    });

    it("transforms relative ../ paths", () => {
      expect(transformPath("../MyComponent", toKebab)).toBe("../my-component");
    });

    it("transforms ~/ paths", () => {
      expect(transformPath("~/components/MyComponent", toKebab)).toBe(
        "~/components/my-component",
      );
    });

    it("transforms @/ paths", () => {
      expect(transformPath("@/components/MyComponent", toKebab)).toBe(
        "@/components/my-component",
      );
    });

    it("transforms @src paths", () => {
      expect(transformPath("@src/components/MyComponent", toKebab)).toBe(
        "@src/components/my-component",
      );
    });

    it("transforms @repo paths", () => {
      expect(transformPath("@repo/components/MyComponent", toKebab)).toBe(
        "@repo/components/my-component",
      );
    });

    it("transforms @mono paths", () => {
      expect(transformPath("@mono/components/MyComponent", toKebab)).toBe(
        "@mono/components/my-component",
      );
    });

    it("transforms # paths", () => {
      expect(transformPath("#components/MyComponent", toKebab)).toBe(
        "#components/my-component",
      );
    });
  });

  describe("leaves non-matching paths unchanged", () => {
    it("does not transform bare module specifiers", () => {
      expect(transformPath("react", toKebab)).toBe("react");
    });

    it("does not transform scoped packages", () => {
      expect(transformPath("@types/node", toKebab)).toBe("@types/node");
    });

    it("does not transform lodash-style imports", () => {
      expect(transformPath("lodash/camelCase", toKebab)).toBe(
        "lodash/camelCase",
      );
    });
  });

  describe("preserves prefixes and extensions", () => {
    it("preserves file extension", () => {
      expect(transformPath("./MyComponent.tsx", toKebab)).toBe(
        "./my-component.tsx",
      );
    });

    it("preserves prefix in output", () => {
      expect(transformPath("../MyComponent", toKebab)).toBe("../my-component");
    });
  });

  describe("handles complex paths", () => {
    it("converts nested relative paths", () => {
      expect(transformPath("../../components/MyComponent", toKebab)).toBe(
        "../../components/my-component",
      );
    });

    it("converts multiple path segments", () => {
      expect(transformPath("./uiElements/ButtonGroup", toKebab)).toBe(
        "./ui-elements/button-group",
      );
    });

    it("handles file with no extension in import", () => {
      expect(transformPath("./myUtils", toKebab)).toBe("./my-utils");
    });

    it("preserves already-converted paths", () => {
      expect(transformPath("./my-component", toKebab)).toBe("./my-component");
    });
  });
});
