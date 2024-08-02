import { test, expect } from "vitest";
import { measureIndentation } from "../indent-tools";

test("source spaces, output spaces, evenly divisible", () => {
  const source = "    ";

  const measured = measureIndentation(source, {
    output: "spaces",
    tabSize: 2,
  });

  expect(measured).toBe(4);
});

test("source spaces, output spaces, not evenly divisible", () => {
  const source = "     ";

  const measured = measureIndentation(source, {
    output: "spaces",
    tabSize: 2,
  });

  // truncates down from 5
  expect(measured).toBe(4);
});

test("source tabs, output tabs", () => {
  const source = "\t\t\t";

  const measured = measureIndentation(source, {
    output: "tabs",
    tabSize: 2,
  });

  expect(measured).toBe(3);
});

test("source spaces, output tabs, evenly divisible", () => {
  const source = "      ";

  const measured = measureIndentation(source, {
    output: "tabs",
    tabSize: 2,
  });

  expect(measured).toBe(3);
});

test("source spaces, output tabs, not evenly divisible", () => {
  const source = "       ";

  const measured = measureIndentation(source, {
    output: "tabs",
    tabSize: 2,
  });

  // truncates down from 3.5
  expect(measured).toBe(3);
});

test("source mixed, output tabs, not evenly divisible", () => {
  const source = "\t\t ";

  const measured = measureIndentation(source, {
    output: "tabs",
    tabSize: 2,
  });

  // truncates down from 2.5
  expect(measured).toBe(2);
});
