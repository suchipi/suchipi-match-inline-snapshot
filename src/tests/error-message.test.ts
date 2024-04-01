import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs } from "./test-utils";

const ownWorkDir = workDirs.concat("error-message");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("error message on non-matching snapshot", async () => {
  const sourceFixturePath = fixturesDir.concat("outdated-snapshot.js");
  const ownFixturePath = ownWorkDir.concat("outdated-snapshot.js");

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

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "node:internal/modules/cjs/loader:1147
      throw err;
      ^

    Error: Cannot find module '..'
    Require stack:
    - /Users/suchipi/Code/error-message.test.ts/outdated-snapshot.js
        at Module._resolveFilename (node:internal/modules/cjs/loader:1144:15)
        at Module._load (node:internal/modules/cjs/loader:985:27)
        at Module.require (node:internal/modules/cjs/loader:1235:19)
        at require (node:internal/modules/helpers:176:18)
        at Object.<anonymous> (/Users/suchipi/Code/error-message.test.ts/outdated-snapshot.js:1:33)
        at Module._compile (node:internal/modules/cjs/loader:1376:14)
        at Module._extensions..js (node:internal/modules/cjs/loader:1435:10)
        at Module.load (node:internal/modules/cjs/loader:1207:32)
        at Module._load (node:internal/modules/cjs/loader:1023:12)
        at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:135:12) {
      code: 'MODULE_NOT_FOUND',
      requireStack: [ '/Users/suchipi/Code/error-message.test.ts/outdated-snapshot.js' ]
    }

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});
