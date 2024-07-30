import { test, expect } from "vitest";
import { normalizeIndentation } from "../indent-tools";
import { visualizeWhitespace } from "./test-utils";

test("mixed leading spaces", () => {
  const input = `
  this
    is
     a
  test;  
`;
  const output = normalizeIndentation(input, { tabSize: 2, output: "spaces" });
  expect(visualizeWhitespace(output, 2)).toMatchInlineSnapshot(
    `
    "␊
    this␊
    ··is␊
    ···a␊
    test;··␊
    "
  `,
  );
});

test("leading spaces, cannot be unindented further", () => {
  const input = `this
    is
     a
  test;  
`;
  const output = normalizeIndentation(input, { tabSize: 2, output: "spaces" });
  expect(visualizeWhitespace(output, 2)).toMatchInlineSnapshot(`
    "this␊
    ····is␊
    ·····a␊
    ··test;··␊
    "
  `);
});

test("leading tabs", () => {
  const input = `
\tthis
\t\tis
\t a
\ttest;
`;
  const output = normalizeIndentation(input, { tabSize: 2, output: "spaces" });
  expect(visualizeWhitespace(output, 2)).toMatchInlineSnapshot(`
    "␊
    this␊
    ··is␊
    ·a␊
    test;␊
    "
  `);
});

test("leading tabs, cannot be unindented further", () => {
  const input = `this
\t\tis
\t a
\ttest;  
`;
  const output = normalizeIndentation(input, { tabSize: 2, output: "tabs" });
  expect(visualizeWhitespace(output, 2)).toMatchInlineSnapshot(`
    "this␊
    → → is␊
    → ·a␊
    → test;··␊
    "
  `);
});

test("mix of leading tabs and leading spaces", () => {
  const input = `
  this
\t\tis
   a
\t\t\ttest;
`;
  const output = normalizeIndentation(input, { tabSize: 1, output: "tabs" });
  expect(visualizeWhitespace(output, 1)).toMatchInlineSnapshot(`
    "␊
    this␊
    is␊
    →a␊
    →test;␊
    "
  `);
});
