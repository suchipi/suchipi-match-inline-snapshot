import * as fs from "node:fs";
import * as t from "pheno";
import type { matchInlineSnapshotInternal } from "./match";
import type { __configRaw } from "./config";

/**
 * An object that {@link matchInlineSnapshotInternal} will use to interact with the
 * filesystem. You set it in {@link __configRaw}.
 */
export type FsDelegate = {
  readFileAsUtf8(filename: string): string;
  writeUtf8ToFile(filename: string, content: string): void;
};

export const defaultFsDelegate: FsDelegate = {
  readFileAsUtf8(filename) {
    return fs.readFileSync(filename, "utf-8");
  },
  writeUtf8ToFile(filename, content) {
    fs.writeFileSync(filename, content);
  },
};

export const t_FsDelegate: t.TypeValidator<FsDelegate> = t.objectWithProperties(
  {
    readFileAsUtf8: t.anyFunction,
    writeUtf8ToFile: t.anyFunction,
  },
);
