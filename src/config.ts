import * as t from "pheno";
import type { SourceMap } from "@suchipi/error-utils";
import type { ParseOptions } from "equivalent-exchange";
import { FsDelegate, defaultFsDelegate, t_FsDelegate } from "./fs-delegate";
import { format as prettyFormat } from "pretty-format";
import {
  CallStructure,
  defaultCallStructure,
  defaultUpdateCallStructure,
  t_CallStructure,
} from "./call-structure";

/** Global configuration for this library. */
export type Config = {
  /**
   * When snapshots don't match:
   * - If this value is `true`, then the snapshot will be changed to the
   *   provided data.
   * - Otherwise, `matchInlineSnapshot` will throw an error which describes the
   *   differences between the snapshot and the provided data.
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
   * - Otherwise, `matchInlineSnapshot` will throw an error.
   *
   * Defaults to **true**.
   *
   * You might want to set this to `false` in CI to disallow comitting empty
   * snapshots.
   */
  shouldCreateNew: boolean;

  /**
   * Whether `matchInlineSnapshot` is allowed to change snapshot content at all,
   * for any reason.
   *
   * Defaults to **true**.
   *
   * Setting this to `false` is kind of like a "dry run" mode.
   */
  isAllowedToChangeSnapshots: boolean;

  /**
   * An object whose methods will be called by `matchInlineSnapshot` in order to
   * read and write files on disk.
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
   * By default, this contains two functions (TODO update me):
   * - [pretty-format](https://www.npmjs.com/package/pretty-format)
   * - A function that wraps a string between newline characters, if the received string contains any newline characters.
   */
  serializers: Array<(actual: any) => any>;

  /**
   * Options for the AST parser used to locate `matchInlineSnapshot` calls. In
   * most cases, you won't need to change these from the defaults.
   */
  parserOptions: ParseOptions;

  /**
   * Option which controls when snapshot updates get written back to disk.
   *
   * - If set to "auto", snapshots will be updated shortly after the
   *   `matchInlineSnapshot` call(s), in a `setTimeout(..., 0)`.
   * - If set to "manual", snapshots won't be updated until you call
   *   `matchInlineSnapshot.flushUpdates`.
   *
   * Defaults to "auto", which is probably good enough for one-off scripts. Test
   * frameworks and other more-involved applications should probably use
   * "manual" instead.
   */
  updateScheduling: "auto" | "manual";

  /**
   * Option which controls which AST code structures will be targeted by the
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
  callStructures: {
    /**
     * The call structure associated with normal `matchInlineSnapshot` calls, such as:
     *
     * ```ts
     * matchInlineSnapshot(something, somethingElse);
     * ```
     */
    normal: CallStructure;

    /**
     * The call structure associated with "force update" `matchInlineSnapshot.u` calls, such as:
     *
     * ```ts
     * matchInlineSnapshot.u(something, somethingElse);
     * ```
     */
    forceUpdate: CallStructure;
  };
};

export const t_Config: t.TypeValidator<Config> =
  t.objectWithOnlyTheseProperties({
    shouldUpdateOutdated: t.boolean,
    shouldCreateNew: t.boolean,
    isAllowedToChangeSnapshots: t.boolean,
    fsDelegate: t_FsDelegate,
    sourceMaps: t.anyObject,
    serializers: t.arrayOf(t.anyFunction),
    parserOptions: t.anyObject,
    updateScheduling: t.or(t.exactString("auto"), t.exactString("manual")),
    callStructures: t.objectWithOnlyTheseProperties({
      normal: t_CallStructure,
      forceUpdate: t_CallStructure,
    }),
  });

/**
 * Controls the behavior of `matchInlineSnapshot`. Change these properties (ie.
 * mutate this object) as needed.
 *
 * This config is global and can be changed on the fly.
 */
export const __configRaw: Config = {
  shouldUpdateOutdated: false,
  shouldCreateNew: true,
  isAllowedToChangeSnapshots: true,
  fsDelegate: defaultFsDelegate,
  sourceMaps: {},
  serializers: [
    prettyFormat,
    function addIndentation(str: string) {
      if (!str.includes("\n")) {
        return str;
      }
      // TODO: pass source indent amount into this function
      // return str
      //   .split("\n")
      //   .map((line) => (line.trim() ? "  " + line : ""))
      //   .join("\n");
      return str;
    },
    function trim(str: string) {
      return str.trim();
    },
    function wrapInEmptyLinesIfMultiline(str: string) {
      return str.includes("\n") ? "\n" + str + "\n" : str;
    },
  ],
  parserOptions: {},
  updateScheduling: "auto",
  callStructures: {
    normal: defaultCallStructure,
    forceUpdate: defaultUpdateCallStructure,
  },
};

export function validateConfig(): Config {
  t.assertType(__configRaw, t_Config);
  return __configRaw;
}
