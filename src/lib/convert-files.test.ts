import { describe, it, expect } from "vitest";
import {
  convertFileName,
  convertSegment,
  getNewPathPhaseOne,
  getNewPathPhaseTwo,
} from "./convert-files";
import { getCasingFunction } from "./get-casing-function";

const toKebab = getCasingFunction("kebab");
const toSnake = getCasingFunction("snake");

describe("convertFileName", () => {
  it("converts camelCase file with extension", () => {
    expect(convertFileName("myComponent.tsx", toKebab)).toBe(
      "my-component.tsx",
    );
  });

  it("converts camelCase file without extension", () => {
    expect(convertFileName("myComponent", toKebab)).toBe("my-component");
  });

  it("preserves underscore-prefixed files", () => {
    expect(convertFileName("_app.tsx", toKebab)).toBe("_app.tsx");
    expect(convertFileName("_document.tsx", toKebab)).toBe("_document.tsx");
  });

  it("preserves all-uppercase files", () => {
    expect(convertFileName("README", toKebab)).toBe("README");
    expect(convertFileName("LICENSE.md", toKebab)).toBe("LICENSE.md");
  });

  it("handles multiple extensions (.d.ts)", () => {
    // path.extname only returns the last extension
    expect(convertFileName("myTypes.d.ts", toKebab)).toBe("my-types.d.ts");
  });

  it("handles .test.ts files", () => {
    expect(convertFileName("myComponent.test.ts", toKebab)).toBe(
      "my-component.test.ts",
    );
  });

  it("works with snake_case casing function", () => {
    expect(convertFileName("myComponent.tsx", toSnake)).toBe(
      "my_component.tsx",
    );
  });

  it("preserves already-converted files", () => {
    expect(convertFileName("my-component.tsx", toKebab)).toBe(
      "my-component.tsx",
    );
  });
});

describe("convertSegment", () => {
  it("converts camelCase segment", () => {
    expect(convertSegment("myComponent", toKebab)).toBe("my-component");
  });

  it("preserves Next.js route params with brackets", () => {
    expect(convertSegment("[id]", toKebab)).toBe("[id]");
    expect(convertSegment("[...slug]", toKebab)).toBe("[...slug]");
  });

  it("preserves underscore-prefixed directories", () => {
    expect(convertSegment("_components", toKebab)).toBe("_components");
  });

  it("adds __tmp suffix when only casing differs", () => {
    // "Mydir" -> toKebab -> "mydir", which differs only in case
    expect(convertSegment("Mydir", toKebab)).toBe("mydir__tmp");
  });

  it("does not add __tmp when result differs in more than casing", () => {
    expect(convertSegment("myComponent", toKebab)).toBe("my-component");
  });

  it("returns unchanged for already-converted segments", () => {
    expect(convertSegment("my-component", toKebab)).toBe("my-component");
  });

  it("works with snake_case casing function", () => {
    expect(convertSegment("myComponent", toSnake)).toBe("my_component");
  });
});

describe("getNewPathPhaseOne", () => {
  it("converts full path with multiple segments", () => {
    expect(getNewPathPhaseOne("src/myComponents/MyButton.tsx", toKebab)).toBe(
      "src/my-components/my-button.tsx",
    );
  });

  it("adds __tmp suffix to segments that only differ in casing", () => {
    expect(getNewPathPhaseOne("src/Mydir/file.ts", toKebab)).toBe(
      "src/mydir__tmp/file.ts",
    );
  });

  it("preserves segments that don't need conversion", () => {
    expect(getNewPathPhaseOne("src/lib/config.ts", toKebab)).toBe(
      "src/lib/config.ts",
    );
  });

  it("handles nested paths", () => {
    expect(
      getNewPathPhaseOne("components/uiElements/ButtonGroup.tsx", toKebab),
    ).toBe("components/ui-elements/button-group.tsx");
  });

  it("preserves underscore-prefixed file in path", () => {
    expect(getNewPathPhaseOne("pages/_app.tsx", toKebab)).toBe(
      "pages/_app.tsx",
    );
  });
});

describe("getNewPathPhaseTwo", () => {
  it("strips __tmp suffix from directory segments", () => {
    expect(getNewPathPhaseTwo("src/mydir__tmp/file.ts")).toBe(
      "src/mydir/file.ts",
    );
  });

  it("strips __tmp suffix from file basenames", () => {
    expect(getNewPathPhaseTwo("src/myfile__tmp.ts")).toBe("src/myfile.ts");
  });

  it("leaves paths without __tmp unchanged", () => {
    expect(getNewPathPhaseTwo("src/my-component/file.ts")).toBe(
      "src/my-component/file.ts",
    );
  });

  it("handles multiple __tmp segments", () => {
    expect(getNewPathPhaseTwo("mydir__tmp/myfile__tmp.ts")).toBe(
      "mydir/myfile.ts",
    );
  });
});
