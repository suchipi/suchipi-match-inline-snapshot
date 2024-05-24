import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, cleanResult } from "./test-utils";

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

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/node_modules/pheno/dist/bundle.js
        throw new ErrorConstructor(messageMaker(target, type));
        ^

    TypeError: Expected value of type objectWithOnlyTheseProperties({ shouldUpdateOutdated: boolean, shouldCreateNew: boolean, isAllowedToChangeSnapshots: boolean, fsDelegate: objectWithProperties({ readFileAsUtf8: anyFunction, writeUtf8ToFile: anyFunction }), sourceMaps: anyObject, serializers: arrayOf(anyFunction), parserOptions: anyObject, updateScheduling: union(exactString("auto"), exactString("manual")), callStructures: objectWithOnlyTheseProperties({ normal: objectWithOnlyTheseProperties({ astPattern: objectWithProperties({ type: string }), snapshotPath: arrayOf(union(string, number)), stackOffset: number }), forceUpdate: objectWithOnlyTheseProperties({ astPattern: objectWithProperties({ type: string }), snapshotPath: arrayOf(union(string, number)), stackOffset: number }) }) }), but received {"shouldUpdateOutdated":false,"shouldCreateNew":true,"isAllowedToChangeSnapshots":true,"fsDelegate":{"readFileAsUtf8":"<Function readFileAsUtf8>","writeUtf8ToFile":"<Function writeUtf8ToFile>"},"sourceMaps":{},"serializers":["<Function format>","<Function addIndentation>","<Function trim>","<Function wrapInEmptyLinesIfMultiline>"],"parserOptions":{},"updateScheduling":"auto","callStructures":{"normal":{"astPattern":{"type":"CallExpression","callee":{"type":"Identifier","name":"matchInlineSnapshot"}},"snapshotPath":["arguments",1],"stackOffset":0},"forceUpdate":{"astPattern":{"type":"CallExpression","callee":{"type":"MemberExpression","object":{"type":"Identifier","name":"matchInlineSnapshot"},"property":{"type":"Identifier","name":"u"}}},"snapshotPath":["arguments",1],"stackOffset":0}},"callStructure":{}}
        at somewhere

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});
