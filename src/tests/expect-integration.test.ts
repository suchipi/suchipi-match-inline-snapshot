import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, cleanResult, diffStrings } from "./test-utils";

const ownWorkDir = workDirs.concat("expect-integration");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("updates the wrapped call instead of the normal call", async () => {
  const sourceFixturePath = fixturesDir.concat("jest-style-call.js");
  const ownFixturePath = ownWorkDir.concat("jest-style-call-1.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/update-outdated.js").toString(),
    "-r",
    fixturesDir.concat("configs/expect-integration.js").toString(),
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

    - expect(2 + 2).toMatchInlineSnapshot();
    + expect(2 + 2).toMatchInlineSnapshot(\`4\`);

      // anotha one
    - expect("9").toMatchInlineSnapshot(\`"10"\`);
    + expect("9").toMatchInlineSnapshot(\`"9"\`);

      // anotha one
    - expect({ yeah: true }).toMatchInlineSnapshot();
    + expect({ yeah: true }).toMatchInlineSnapshot(\`
    + Object {
    +   "yeah": true,
    + }
    + \`);
    "
  `);
});

test("the error message still makes sense", async () => {
  const sourceFixturePath = fixturesDir.concat("jest-style-call.js");
  const ownFixturePath = ownWorkDir.concat("jest-style-call-2.js");

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/expect-integration.js").toString(),
    ownFixturePath.toString(),
  ]);
  await run.completion;

  const contentAfter = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/node_modules/expect/build/index.js:314
          throw error;
          ^

    JestAssertionError: Received value didn't match snapshot.

    - Snapshot  - 1
    + Received  + 1

    - "10"
    + "9"
        at somewhere
      matcherResult: {
        message: "Received value didn't match snapshot.\\n" +
          '\\n' +
          '- Snapshot  - 1\\n' +
          '+ Received  + 1\\n' +
          '\\n' +
          '- "10"\\n' +
          '+ "9"\\n',
        pass: false
      }
    }

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);

  // Doesn't update snapshot
  expect(contentBefore).toBe(contentAfter);
});

test("makes expect.addSnapshotSerializer throw", async () => {
  const sourceFixturePath = fixturesDir.concat(
    "expect-add-snapshot-serializer.js",
  );
  const ownFixturePath = ownWorkDir.concat(
    "expect-add-snapshot-serializer-1.js",
  );

  fs.copyFileSync(sourceFixturePath.toString(), ownFixturePath.toString());

  const contentBefore = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  const run = spawn("node", [
    "-r",
    fixturesDir.concat("configs/make-library-global.js").toString(),
    "-r",
    fixturesDir.concat("configs/expect-integration.js").toString(),
    ownFixturePath.toString(),
  ]);
  await run.completion;

  const contentAfter = fs.readFileSync(ownFixturePath.toString(), "utf-8");

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/dist/expect-integration.js:52
            throw new Error("Modify matchInlineSnapshot.config.serializers instead of calling expect.addSnapshotSerializer");
            ^

    Error: Modify matchInlineSnapshot.config.serializers instead of calling expect.addSnapshotSerializer
        at somewhere

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);

  // Doesn't update snapshot
  expect(contentBefore).toBe(contentAfter);
});
