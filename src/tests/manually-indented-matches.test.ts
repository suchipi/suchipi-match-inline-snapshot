import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs } from "./test-utils";

const ownWorkDir = workDirs.concat("manually-indented-matches");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("handles correct snapshots appropriately", async () => {
  const sourceFixturePath = fixturesDir.concat("manually-indented-matches.js");
  const ownFixturePath = ownWorkDir.concat("manually-indented-matches-1.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
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

  // Doesn't update snapshot
  expect(contentBefore).toBe(contentAfter);
});
