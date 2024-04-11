import type { SourceMap } from "@suchipi/error-utils";
import type { ParseOptions } from "equivalent-exchange";
import type { matchInlineSnapshot } from "./match";
import { FsDelegate, defaultFsDelegate } from "./fs-delegate";
import { format as prettyFormat } from "pretty-format";
import { CallStructure, defaultCallStructure } from "./call-structure";

/** Global configuration for this library. */
export type Config = {
  /**
   * When snapshots don't match:
   * - If this value is `true`, then the snapshot will be changed to the
   *   provided data.
   * - Otherwise, {@link matchInlineSnapshot} will throw an error which
   *   describes the differences between the snapshot and the provided data.
   *
   * Defaults to **false**.
   *
   * Set this to `true` when you want to update your snapshots.
   */
  shouldUpdateOutdated: boolean;

  /**
   * When the second argument to matchSnapshot isn't present:
   * - If this value is `true`, the second argument will get filled in with the
   *   provided data.
   * - Otherwise, {@link matchInlineSnapshot} will throw an error.
   *
   * Defaults to **true**.
   *
   * You might want to set this to `false` in CI to disallow comitting empty
   * snapshots.
   */
  shouldCreateNew: boolean;

  /**
   * Whether {@link matchInlineSnapshot} is allowed to change snapshot content
   * at all, for any reason.
   *
   * Defaults to **true**.
   *
   * Setting this to `false` is kind of like a "dry run" mode.
   */
  isAllowedToChangeSnapshots: boolean;

  /**
   * An object whose methods will be called by {@link matchInlineSnapshot} in
   * order to read and write files on disk.
   *
   * The default implementation uses node's builtin module `fs`. You may swap it
   * for a different implementation as needed.
   */
  fsDelegate: FsDelegate;

  /**
   * Source maps which will be used to find the location of
   * `matchInlineSnapshot` calls.
   */
  sourceMaps: {
    [filename: string]: SourceMap;
  };

  /**
   * Functions to pass the input value through in order to arrive at the final
   * snapshot format.
   *
   * By default, this contains two functions:
   * - [pretty-format](https://www.npmjs.com/package/pretty-format)
   * - A function that wraps a string between newline characters, if the received string contains any newline characters.
   */
  serializers: Array<(actual: any) => any>;

  /**
   * Options for the AST parser used to locate {@link matchInlineSnapshot}
   * calls. In most cases, you won't need to change these from the defaults.
   */
  parserOptions: ParseOptions;

  /**
   * Option which controls when snapshot updates get written back to disk.
   *
   * - If set to "auto", snapshots will be updated shortly after the
   *   {@link matchInlineSnapshot} call(s), in a `setTimeout(..., 0)`.
   * - If set to "manual", snapshots won't be updated until you call
   *   `matchInlineSnapshot.flushUpdates`.
   *
   * Defaults to "auto", which is probably good enough for one-off scripts. Test
   * frameworks and other more-involved applications should probably use
   * "manual" instead.
   */
  updateScheduling: "auto" | "manual";

  /**
   * Option which controls which AST code structure will be targeted by the
   * update system.
   *
   * By default, it looks for code like:
   * ```ts
   * matchInlineSnapshot(something, somethingElse);
   * ```
   * but you could configure this option to make it instead look for (as an
   * example):
   * ```ts
   * expect(something).toMatchInlineSnapshot(somethingElse);
   * ```
   *
   * See the doc comments on the {@link CallStructure} type for more info.
   */
  callStructure: CallStructure;
};

/**
 * Controls the behavior of {@link matchInlineSnapshot}. Change these properties
 * (ie. mutate this object) as needed.
 *
 * This config is global and can be changed on the fly.
 */
export const config: Config = {
  shouldUpdateOutdated: false,
  shouldCreateNew: true,
  isAllowedToChangeSnapshots: true,
  fsDelegate: defaultFsDelegate,
  sourceMaps: {},
  serializers: [
    prettyFormat,
    (str: string) => (str.includes("\n") ? "\n" + str + "\n" : str),
  ],
  parserOptions: {},
  updateScheduling: "auto",
  callStructure: defaultCallStructure,
};
