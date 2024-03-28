import * as fs from "node:fs";
import type { matchInlineSnapshot } from "./match";
import type { config } from "./config";

/**
 * An object that {@link matchInlineSnapshot} will use to interact with the
 * filesystem. You set it in {@link config}.
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
