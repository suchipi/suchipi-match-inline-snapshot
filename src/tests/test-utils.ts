import { RunContext } from "first-base";
import { Path } from "nice-path";

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
