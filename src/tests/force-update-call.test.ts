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
      "stderr": "Error: Attempting to create new snapshot, but config.shouldCreateNew was false.
        at somewhere
    Error: Received value didn't match snapshot.

    - Snapshot  - 1
    + Received  + 5

    - 4
    +
    + Object {
    +   "a": true,
    + }
    +
        at somewhere
    ",
      "stdout": "",
    }
  `);

  // Updates snapshot
  expect(contentBefore).not.toBe(contentAfter);

  expect(diffStrings({ contentBefore, contentAfter })).toMatchInlineSnapshot(`
    "- contentBefore
    + contentAfter

      matchInlineSnapshot.config.shouldCreateNew = false;

      function tryAndLog(cb) {
        try {
          cb();
        } catch (err) {
          console.error(err);
        }
      }

      tryAndLog(() => {
        matchInlineSnapshot({ a: true });
      });

      tryAndLog(() => {
        matchInlineSnapshot({ a: true }, "4");
      });

      tryAndLog(() => {
        matchInlineSnapshot.u(
          { b: true },
          \`
    -   Object {}
    + Object {
    -   \`,
    +   "b": true,
    + }
    + \`,
        );
      });
    "
  `);
});
