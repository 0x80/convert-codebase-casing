import { describe, it, expect } from "vitest";
import jscodeshift from "jscodeshift";
import updateImportsAndExports from "./update-imports-and-exports";
import { getCasingFunction } from "../../lib/get-casing-function";

const toKebab = getCasingFunction("kebab");

function transform(source: string): string | null {
  const j = jscodeshift.withParser("tsx");
  const root = j(source);
  return updateImportsAndExports(j, root, toKebab);
}

describe("updateImportsAndExports", () => {
  it("transforms ES6 import declarations", () => {
    const input = `import { Button } from './MyComponent';`;
    const output = transform(input);
    expect(output).toContain(`"./my-component"`);
  });

  it("transforms named exports with source", () => {
    const input = `export { foo } from './MyModule';`;
    const output = transform(input);
    expect(output).toContain(`"./my-module"`);
  });

  it("transforms export all declarations", () => {
    const input = `export * from './MyModule';`;
    const output = transform(input);
    expect(output).toContain(`"./my-module"`);
  });

  it("transforms TypeScript import type", () => {
    const input = `import type { MyType } from './MyTypes';`;
    const output = transform(input);
    expect(output).toContain(`"./my-types"`);
  });

  it("transforms require() calls", () => {
    const input = `const mod = require('./MyModule');`;
    const output = transform(input);
    expect(output).toContain(`"./my-module"`);
  });

  it("transforms new URL() expressions", () => {
    const input = `const url = new URL('./MyWorker', import.meta.url);`;
    const output = transform(input);
    expect(output).toContain(`"./my-worker"`);
  });

  it("does not transform dynamic import() (tsx parser treats import() as CallExpression, not ImportExpression)", () => {
    // jscodeshift's tsx parser parses import() as CallExpression with callee.type "Import"
    // rather than ImportExpression, so j.ImportExpression doesn't match
    const input = `async function load() { const mod = await import('./MyModule'); }`;
    const output = transform(input);
    expect(output).toBeNull();
  });

  it("does not transform dynamic() with arrow function import (same parser limitation)", () => {
    const input = `const Component = dynamic(() => import('./MyComponent'), { ssr: false });`;
    const output = transform(input);
    expect(output).toBeNull();
  });

  it("leaves non-matching imports unchanged", () => {
    const input = `import React from 'react';`;
    const output = transform(input);
    expect(output).toBeNull();
  });

  it("returns null when no changes are made", () => {
    const input = `import { foo } from 'lodash';`;
    const output = transform(input);
    expect(output).toBeNull();
  });

  it("handles mixed imports - transforms only matching ones", () => {
    const input = `
import React from 'react';
import { Button } from './MyComponent';
import lodash from 'lodash';
import { utils } from '../helperUtils';
`;
    const output = transform(input);
    expect(output).not.toBeNull();
    expect(output).toContain(`from 'react'`);
    expect(output).toContain(`"./my-component"`);
    expect(output).toContain(`from 'lodash'`);
    expect(output).toContain(`"../helper-utils"`);
  });

  it("transforms paths with extensions", () => {
    const input = `import { Button } from './MyComponent.tsx';`;
    const output = transform(input);
    expect(output).toContain(`"./my-component.tsx"`);
  });

  it("transforms @/ alias imports", () => {
    const input = `import { Button } from '@/components/MyComponent';`;
    const output = transform(input);
    expect(output).toContain(`"@/components/my-component"`);
  });
});
