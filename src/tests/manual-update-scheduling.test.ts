import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, cleanResult, diffStrings } from "./test-utils";

const ownWorkDir = workDirs.concat("manual-update-scheduling");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("updates the snapshots that have been encountered thus far, at the expense of stuff that appears later in the same file", async () => {
  const sourceFixturePath = fixturesDir.concat("three-outdated-with-update.js");
  const ownFixturePath = ownWorkDir.concat("three-outdated-with-update-1.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/update-outdated.js").toString(),
    "-r",
    fixturesDir.concat("configs/manual-update-scheduling.js").toString(),
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

  // Updates snapshot
  expect(contentBefore).not.toBe(contentAfter);

  expect(diffStrings({ contentBefore, contentAfter })).toMatchInlineSnapshot(`
    "- contentBefore
    + contentAfter

    - matchInlineSnapshot({ a: true });
    + matchInlineSnapshot({ a: true }, \`
    + Object {
    +   "a": true,
    + }
    + \`);

      matchInlineSnapshot(
        { b: true },
        \`
    - Object {}
    + Object {
    +   "c": true,
    + }
      \`,
      );
      matchInlineSnapshot.flushUpdates();

      // this one fucks up the previous one due to previous snapshots changing the
      // line number of this call. that's just a casualty of how manual update
      // flushing works
      matchInlineSnapshot({ c: true });

      matchInlineSnapshot.flushUpdates();
    "
  `);
});
