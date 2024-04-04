import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, cleanResult, diffStrings } from "./test-utils";

const ownWorkDir = workDirs.concat("update-outdated");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("updates outdated snapshot when configured to do so", async () => {
  const sourceFixturePath = fixturesDir.concat("outdated-snapshot.js");
  const ownFixturePath = ownWorkDir.concat("outdated-snapshot-1.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/update-outdated.js").toString(),
    ownFixturePath.toString(),
  ]);
  await run.completion;

  const contentAfter = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "",
    }
  `);

  const identity = <T>(val: T) => val;

  // Updates snapshot
  expect(contentBefore).not.toBe(contentAfter);

  expect(diffStrings({ contentBefore, contentAfter })).toMatchInlineSnapshot(`
    "- contentBefore
    + contentAfter

      matchInlineSnapshot(
        { a: true },
        \`
      Object {
    -   "a": false,
    +   "a": true,
      }
      \`,
      );
    "
  `);
});
