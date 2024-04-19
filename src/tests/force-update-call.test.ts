import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, cleanResult, diffStrings } from "./test-utils";

const ownWorkDir = workDirs.concat("force-update-call");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("matchInlineSnapshot.u can be used to update snapshots even when shouldUpdate is false", async () => {
  const sourceFixturePath = fixturesDir.concat(
    "two-outdated-one-force-update.js",
  );
  const ownFixturePath = ownWorkDir.concat(
    "two-outdated-one-force-update-1.js",
  );

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    // Note: update-outdated is NOT loaded here
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

      matchInlineSnapshot.u(
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