import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, cleanResult, diffStrings } from "./test-utils";

const ownWorkDir = workDirs.concat("custom-call-structure");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("updates the wrapped call instead of the normal call", async () => {
  const sourceFixturePath = fixturesDir.concat("custom-call.js");
  const ownFixturePath = ownWorkDir.concat("custom-call-1.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/update-outdated.js").toString(),
    "-r",
    fixturesDir.concat("configs/custom-call-structure.js").toString(),
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

    - stuff.match();
    + stuff.match(\`5\`);

      // anotha one
    - stuff.match("9", {});
    + stuff.match(\`5\`, {});

      // anotha one
    - stuff.match("", {}, 57);
    + stuff.match(\`57\`, {}, 57);
    "
  `);
});

test("the error message still makes sense", async () => {
  const sourceFixturePath = fixturesDir.concat("custom-call.js");
  const ownFixturePath = ownWorkDir.concat("custom-call-2.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/custom-call-structure.js").toString(),
    ownFixturePath.toString(),
  ]);
  await run.completion;

  const contentAfter = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/dist/match.js:77
                    throw new Error(message);
                    ^

    Error: Received value didn't match snapshot.

    - Snapshot  - 1
    + Received  + 1

    - 9
    + 5
        at somewhere

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);

  // Doesn't update snapshot
  expect(contentBefore).toBe(contentAfter);
});
