import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, cleanResult } from "./test-utils";

const ownWorkDir = workDirs.concat("error-message");

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
    ownFixturePath.toString(),
  ]);
  await run.completion;

  const contentAfter = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  // Doesn't update snapshot
  expect(contentBefore).toBe(contentAfter);

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

      ↵
      Object {
    -   "a": false,
    +   "a": true,
      }
      ↵
        at somewhere

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});

test("error message on non-matching snapshot (with colors)", async () => {
  const sourceFixturePath = fixturesDir.concat("outdated-snapshot.js");
  const ownFixturePath = ownWorkDir.concat("outdated-snapshot-2.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn(
    "node",
    [
      "-r",
      fixturesDir.concat("configs/make-library-global.js").toString(),
      ownFixturePath.toString(),
    ],
    {
      env: {
        ...process.env,
        FORCE_COLOR: "1",
      },
    },
  );
  await run.completion;

  const contentAfter = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  // Doesn't update snapshot
  expect(contentBefore).toBe(contentAfter);

  // Uncomment to manually verify that the colors look okay
  // console.log(run.result.stderr);

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/dist/match.js:77
                    throw new Error(message);
                    ^

    Error: Received value didn't match snapshot.

    [38;2;128;0;128m[48;2;255;215;255m- Snapshot  - 1[49m[39m
    [38;2;0;95;95m[48;2;215;255;255m+ Received  + 1[49m[39m

    [2m  ↵[22m
    [2m  Object {[22m
    [38;2;128;0;128m[48;2;255;215;255m-   "a": [7mfals[27me,[49m[39m
    [38;2;0;95;95m[48;2;215;255;255m+   "a": [7mtru[27me,[49m[39m
    [2m  }[22m
    [2m  ↵[22m
        at somewhere

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});
