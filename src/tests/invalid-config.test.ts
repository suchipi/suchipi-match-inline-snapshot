import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs } from "./test-utils";

const ownWorkDir = workDirs.concat("invalid-config");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("error message on non-matching snapshot", async () => {
  const sourceFixturePath = fixturesDir.concat("outdated-snapshot.js");
  const ownFixturePath = ownWorkDir.concat("outdated-snapshot-1.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/invalid-config.js").toString(),
    ownFixturePath.toString(),
  ]);
  await run.completion;

  const contentAfter = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  // Doesn't update snapshot
  expect(contentBefore).toBe(contentAfter);

  expect(run.cleanResult()).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/node_modules/pheno/dist/bundle.js
        throw new ErrorConstructor(messageMaker(target, type));
        ^

    TypeError: config.callStructures.normal should be an objectWithOnlyTheseProperties({ astPattern: objectWithProperties({ type: string }), snapshotPath: arrayOf(union(string, number)), stackOffset: number }), but it was "<undefined>"
        at somewhere

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});
