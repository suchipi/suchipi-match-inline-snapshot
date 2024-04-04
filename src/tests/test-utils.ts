import { RunContext } from "first-base";
import { Path } from "nice-path";
import { diffStringsUnified } from "jest-diff";

export const rootDir = new Path(__dirname, "..", "..").normalize();
export const fixturesDir = rootDir.concat("test-fixtures");
export const workDirs = rootDir.concat("test-workdirs");

export function cleanStr(str: string): string {
  return (
    str
      // replace absolute paths with <rootDir> so that snapshots don't differ
      // depending on where the repo was cloned locally
      .replaceAll(rootDir.toString(), "<rootDir>")
      // replace stack trace lines with a single "at somewhere" line
      // explanation of regexp:
      //   newline, optional ansi escape, zero or more whitespace(s), "at",
      //   whitespace(s), several non-newline characters... and that whole
      //   thing can happen more than once
      .replaceAll(/(?:\n(?:\x1B\[\d+m)?(\s*)at\s+[^\n]+)+/g, "\n$1at somewhere")
  );
}

export function cleanResult(result: RunContext["result"]) {
  return {
    ...result,
    stdout: cleanStr(result.stdout),
    stderr: cleanStr(result.stderr),
  };
}

const identity = <T>(val: T) => val;

export function diffStrings(namedStrings: { [key: string]: string }) {
  const names: Array<string> = [];
  const values: Array<string> = [];

  let i = 0;
  for (const key in namedStrings) {
    if (Object.hasOwn(namedStrings, key)) {
      if (i < 2) {
        names.push(key);
        values.push(namedStrings[key]);
        i++;
      } else {
        break;
      }
    }
  }

  return diffStringsUnified(values[0], values[1], {
    aAnnotation: names[0],
    bAnnotation: names[1],
    aColor: identity,
    bColor: identity,
    changeColor: identity,
    commonColor: identity,
    changeLineTrailingSpaceColor: identity,
    commonLineTrailingSpaceColor: identity,
    patchColor: identity,
  });
}
