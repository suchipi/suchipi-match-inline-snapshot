import * as fs from "node:fs";
import * as t from "pheno";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/test-snapshot:fs-delegate");

/**
 * An object that `matchInlineSnapshot` will use to interact with the
 * filesystem. You set it in `matchInlineSnapshot.config`.
 */
export type FsDelegate = {
  readFileAsUtf8(filename: string): string;
  writeUtf8ToFile(filename: string, content: string): void;
};

export const defaultFsDelegate: FsDelegate = {
  readFileAsUtf8(filename) {
    debug("reading", filename);
    return fs.readFileSync(filename, "utf-8");
  },
  writeUtf8ToFile(filename, content) {
    debug("writing", filename);
    fs.writeFileSync(filename, content);
  },
};

export const t_FsDelegate: t.TypeValidator<FsDelegate> = t.objectWithProperties(
  {
    readFileAsUtf8: t.anyFunction,
    writeUtf8ToFile: t.anyFunction,
  },
);
