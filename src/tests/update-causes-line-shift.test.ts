import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, diffStrings } from "./test-utils";

const ownWorkDir = workDirs.concat("update-causes-line-shift");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("when first update shifts second call position, second call still gets updated", async () => {
  const sourceFixturePath = fixturesDir.concat("one-new-one-outdated.js");
  const ownFixturePath = ownWorkDir.concat("one-new-one-outdated-1.js");

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

  expect(run.cleanResult()).toMatchInlineSnapshot(`
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
    +   "b": true,
    + }
      \`,
      );
    "
  `);
});
