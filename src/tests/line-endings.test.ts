import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirs, diffStrings } from "./test-utils";
import { visualizeWhitespace } from "./test-utils";

const ownWorkDir = workDirs.concat("line-endings");
const fixture = fixturesDir.concat("line-endings.js");

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmSync(ownWorkDir.toString(), { recursive: true });
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("updates with LF", async () => {
  const content = fs.readFileSync(fixture.toString(), "utf-8");
  const contentLF = content.replaceAll(/(?:\r\n|\n\r|\r|\n)/g, "\n");

  const ownFixturePath = ownWorkDir.concat("updates-with-lf.js");

  fs.writeFileSync(ownFixturePath.toString(), contentLF);

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

  expect(run.cleanResult()).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "",
    }
  `);

  // Updates snapshot
  expect(contentBefore).not.toBe(contentAfter);

  expect(
    diffStrings({
      contentBefore: visualizeWhitespace(contentBefore, 2),
      contentAfter: visualizeWhitespace(contentAfter, 2),
    }),
  ).toMatchInlineSnapshot(`
    "- contentBefore
    + contentAfter

      //·new␊
    - matchInlineSnapshot({·a:·true·});␊
    + matchInlineSnapshot({·a:·true·},·\`␊
    + Object·{␊
    + ··"a":·true,␊
    + }␊
    + \`);␊
      ␊
      //·intentional·double-empty-line·below:␊
      ␊
      ␊
      //·outdated␊
      matchInlineSnapshot(␊
      ··{·b:·true·},␊
      ··\`␊
    - Object·{}␊
    + Object·{␊
    + ··"b":·true,␊
    + }␊
      \`,␊
      );␊
      ␊
      //·up-to-date␊
      matchInlineSnapshot(␊
      ··{·c:·false·},␊
      ··\`␊
      Object·{␊
    - ··c:·false,␊
    + ··"c":·false,␊
      }␊
      \`,␊
      );␊
    "
  `);
});

test("updates with CRLF", async () => {
  const content = fs.readFileSync(fixture.toString(), "utf-8");
  const contentCRLF = content.replaceAll(/(?:\r\n|\n\r|\r|\n)/g, "\r\n");

  const ownFixturePath = ownWorkDir.concat("updates-with-crlf.js");

  fs.writeFileSync(ownFixturePath.toString(), contentCRLF);

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

  expect(run.cleanResult()).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "",
    }
  `);

  // Updates snapshot
  expect(contentBefore).not.toBe(contentAfter);

  expect(
    diffStrings({
      contentBefore: visualizeWhitespace(contentBefore, 2),
      contentAfter: visualizeWhitespace(contentAfter, 2),
    }),
  ).toMatchInlineSnapshot(`
    "- contentBefore
    + contentAfter

      //·new␍␊
    - matchInlineSnapshot({·a:·true·});␍␊
    + matchInlineSnapshot({·a:·true·},·\`␍␊
    + Object·{␍␊
    + ··"a":·true,␍␊
    + }␍␊
    + \`);␍␊
      ␍␊
      //·intentional·double-empty-line·below:␍␊
      ␍␊
      ␍␊
      //·outdated␍␊
      matchInlineSnapshot(␍␊
      ··{·b:·true·},␍␊
      ··\`␍␊
    - Object·{}␍␊
    + Object·{␍␊
    + ··"b":·true,␍␊
    + }␍␊
      \`,␍␊
      );␍␊
      ␍␊
      //·up-to-date␍␊
      matchInlineSnapshot(␍␊
      ··{·c:·false·},␍␊
      ··\`␍␊
      Object·{␍␊
    - ··c:·false,␍␊
    + ··"c":·false,␍␊
      }␍␊
      \`,␍␊
      );␍␊
    "
  `);
});
