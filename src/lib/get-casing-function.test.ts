import { describe, it, expect } from "vitest";
import { getCasingFunction } from "./get-casing-function";

const kebabCase = getCasingFunction("kebab");
const snakeCase = getCasingFunction("snake");

describe("getCasingFunction", () => {
  it("returns kebabCase for 'kebab'", () => {
    const fn = getCasingFunction("kebab");
    expect(fn("camelCase")).toBe("camel-case");
  });

  it("returns snakeCase for 'snake'", () => {
    const fn = getCasingFunction("snake");
    expect(fn("camelCase")).toBe("camel_case");
  });
});

describe("kebabCase", () => {
  it("converts camelCase", () => {
    expect(kebabCase("camelCase")).toBe("camel-case");
  });

  it("converts PascalCase", () => {
    expect(kebabCase("PascalCase")).toBe("pascal-case");
  });

  it("converts underscores", () => {
    expect(kebabCase("with_underscores")).toBe("with-underscores");
  });

  it("converts spaces", () => {
    expect(kebabCase("with spaces")).toBe("with-spaces");
  });

  it("preserves already kebab-case", () => {
    expect(kebabCase("already-kebab")).toBe("already-kebab");
  });

  it("handles single word", () => {
    expect(kebabCase("word")).toBe("word");
  });

  it("handles acronyms like XMLParser", () => {
    expect(kebabCase("XMLParser")).toBe("xmlparser");
  });

  it("handles consecutive capitals", () => {
    expect(kebabCase("getHTTPResponse")).toBe("get-httpresponse");
  });

  it("handles multiple camelCase boundaries", () => {
    expect(kebabCase("myComponentName")).toBe("my-component-name");
  });
});

describe("snakeCase", () => {
  it("converts camelCase", () => {
    expect(snakeCase("camelCase")).toBe("camel_case");
  });

  it("converts PascalCase", () => {
    expect(snakeCase("PascalCase")).toBe("pascal_case");
  });

  it("converts hyphens", () => {
    expect(snakeCase("with-hyphens")).toBe("with_hyphens");
  });

  it("converts spaces", () => {
    expect(snakeCase("with spaces")).toBe("with_spaces");
  });

  it("preserves already snake_case", () => {
    expect(snakeCase("already_snake")).toBe("already_snake");
  });

  it("handles single word", () => {
    expect(snakeCase("word")).toBe("word");
  });

  it("handles acronyms like XMLParser", () => {
    expect(snakeCase("XMLParser")).toBe("xmlparser");
  });

  it("handles consecutive capitals", () => {
    expect(snakeCase("getHTTPResponse")).toBe("get_httpresponse");
  });

  it("handles multiple camelCase boundaries", () => {
    expect(snakeCase("myComponentName")).toBe("my_component_name");
  });
});
