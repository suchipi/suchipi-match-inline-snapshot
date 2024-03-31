import fs from "node:fs";
import { test, beforeEach, expect } from "vitest";
import { spawn } from "first-base";
import { fixturesDir, workDirForFile } from "./test-utils";

const ownWorkDir = workDirForFile(__filename);

beforeEach(() => {
  if (fs.existsSync(ownWorkDir.toString())) {
    fs.rmdirSync(ownWorkDir.toString());
  }
  fs.mkdirSync(ownWorkDir.toString(), { recursive: true });
});

test("error message on non-matching snapshot", async () => {
  const ownFixturePath = fs.copyFileSync(
    fixturesDir.concat("outdated-snapshot.js").toString(),
    ownWorkDir.concat("outdated-snapshot.js").toString(),
  );
});
