import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { diffStringsUnified } from "jest-diff";
import { fixturesDir, workDirs, cleanResult } from "./test-utils";

const ownWorkDir = workDirs.concat("update-multi-outdated");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("updates two outdated snapshots when configured to do so", async () => {
  const sourceFixturePath = fixturesDir.concat("two-outdated-snapshot.js");
  const ownFixturePath = ownWorkDir.concat("two-outdated-snapshot-1.js");

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

  expect(
    diffStringsUnified(contentBefore, contentAfter, {
      aAnnotation: "contentBefore",
      bAnnotation: "contentAfter",
      aColor: identity,
      bColor: identity,
      changeColor: identity,
      commonColor: identity,
      changeLineTrailingSpaceColor: identity,
      commonLineTrailingSpaceColor: identity,
      patchColor: identity,
    }),
  ).toMatchInlineSnapshot(`
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
