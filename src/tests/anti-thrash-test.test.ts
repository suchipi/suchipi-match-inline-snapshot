import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs } from "./test-utils";

const ownWorkDir = workDirs.concat("anti-thrash-test");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("updating repeatedly does not thrash file content back and forth endlessly", async () => {
  const sourceFixturePath = fixturesDir.concat("outdated-snapshot.js");
  const ownFixturePath = ownWorkDir.concat("outdated-snapshot-1.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  async function runFixture() {
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

    return { result: run.cleanResult(), contentBefore, contentAfter };
  }

  const run1 = await runFixture();
  expect(run1.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "",
    }
  `);

  // Updates snapshot
  expect(run1.contentBefore).not.toBe(run1.contentAfter);

  const run2 = await runFixture();
  expect(run2.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "",
    }
  `);

  // Content shouldn't have changed
  expect(run2.contentBefore).toBe(run2.contentAfter);

  const run3 = await runFixture();
  expect(run3.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "",
    }
  `);

  // Content shouldn't have changed
  expect(run3.contentBefore).toBe(run3.contentAfter);

  // TODO: could put a filesystem watcher in here, too, to validate that it
  // isn't written to when content matches
});
