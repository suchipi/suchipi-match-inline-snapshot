import * as fs from "node:fs";
import * as t from "pheno";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/match-inline-snapshot:fs-delegate");

/**
 * An object that `matchInlineSnapshot` will use to interact with the
 * filesystem. You set it in `matchInlineSnapshot.config`.
 */
export type FsDelegate = {
  readFileAsUtf8(fileName: string): string;
  writeUtf8ToFile(fileName: string, content: string): void;
};

export const defaultFsDelegate: FsDelegate = {
  readFileAsUtf8(fileName) {
    debug("reading", fileName);
    return fs.readFileSync(fileName, "utf-8");
  },
  writeUtf8ToFile(fileName, content) {
    debug("writing", fileName);
    fs.writeFileSync(fileName, content);
  },
};

export const t_FsDelegate: t.TypeValidator<FsDelegate> = t.objectWithProperties(
  {
    readFileAsUtf8: t.anyFunction,
    writeUtf8ToFile: t.anyFunction,
  },
);
