import { test, expect } from "vitest";
import { detectEOL } from "../detect-eol";

test("LF", () => {
  const result = detectEOL(`\navjfdkd  \ndsjfkds\n  djfkdsl\n\n`);
  expect(result).toBe("\n");
});

test("CRLF", () => {
  const result = detectEOL(`\r\navjfdkd  \r\ndsjfkds\r\n  djfkdsl\r\n\r\n`);
  expect(result).toBe("\r\n");
});

test("CR", () => {
  const result = detectEOL(`\ravjfdkd  \rdsjfkds\r  djfkdsl\r\r`);
  expect(result).toBe("\r");
});

test("LFCR", () => {
  const result = detectEOL(`\n\ravjfdkd  \n\rdsjfkds\n\r  djfkdsl\n\r\n\r`);
  expect(result).toBe("\n\r");
});

test("evenly mixed", () => {
  const result = detectEOL(`\navjfdkd  \r\ndsjfkds\r  djfkdsl\n\r`);
  expect(result).toBe(null);
});

test("evenly mixed, fallback provided", () => {
  const result = detectEOL(`\navjfdkd  \r\ndsjfkds\r  djfkdsl\n\r`, "\n");
  expect(result).toBe("\n");
});

test("mixed, more LF", () => {
  const result = detectEOL(`\navjfdkd  \r\ndsjfkds\r  djfkdsl\n\r   and\n`);
  expect(result).toBe("\n");
});

test("mixed, more CRLF", () => {
  const result = detectEOL(`\navjfdkd  \r\ndsjfkds\r  djfkdsl\n\r   and\r\n`);
  expect(result).toBe("\r\n");
});

test("mixed, more CR", () => {
  const result = detectEOL(`\navjfdkd  \r\ndsjfkds\r  djfkdsl\n\r   and\r`);
  expect(result).toBe("\r");
});

test("mixed, more LFCR", () => {
  const result = detectEOL(`\navjfdkd  \r\ndsjfkds\r  djfkdsl\n\r   and\n\r`);
  expect(result).toBe("\n\r");
});

test("no newlines", () => {
  const result = detectEOL(`hi there`);
  expect(result).toBe(null);
});

test("no newlines, fallback provided", () => {
  const result = detectEOL(`hi there`, "\n");
  expect(result).toBe("\n");
});
