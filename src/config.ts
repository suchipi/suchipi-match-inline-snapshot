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
   * By default, this contains two functions:
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

  /**
   * Settings which control how/if the resulting snapshots are indented.
   */
  indentation: {
    // Not yet implemented
    // /**
    //  * Whether snapshots created by `matchInlineSnapshot` should be indented to
    //  * the level of their surrounding code.
    //  *
    //  * Defaults to **true**.
    //  */
    // enabled: boolean;

    /**
     * The character width that `matchInlineSnapshot` should use for tabs, for
     * the purpose of indentation calculations.
     *
     * Defaults to **2**.
     */
    tabSize: number;

    /**
     * Whether snapshots should be indented using tabs or spaces.
     *
     * Defaults to **"spaces"**.
     */
    output: "tabs" | "spaces";
  };

  /**
   * When `matchInlineSnapshot` adds lines to a file, it needs to choose which
   * line ending characters to use. It attempts to autodetect based on the line
   * endings in the file, but in files with no line endings (or evenly-mixed
   * line endings), `matchInlineSnapshot` uses "\r\n" on Windows and "\n" on
   * other platforms. To override that fallback, modify this value.
   */
  fallbackLineEnding: "\n" | "\r\n";
};

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
    (str: string) => (str.includes("\n") ? "\n" + str + "\n" : str),
  ],
  parserOptions: {},
  updateScheduling: "auto",
  callStructures: {
    normal: defaultCallStructure,
    forceUpdate: defaultUpdateCallStructure,
  },
  indentation: {
    // Not yet implemented
    // enabled: true,
    tabSize: 2,
    output: "spaces",
  },
  fallbackLineEnding: process.platform === "win32" ? "\r\n" : "\n",
};

const makeMessageMaker =
  (name: string) => (target: any, expectedType: t.TypeValidator<any>) => {
    const typeName = expectedType.name;
    return `${name} should be ${/^[aeiou]/i.test(typeName) ? "an" : "a"} ${typeName}, but it was ${t.stringifyValue(target)}`;
  };

export function validateConfig(): Config {
  t.assertType(__configRaw, t.object, makeMessageMaker("config"));

  t.assertType(
    __configRaw.shouldUpdateOutdated,
    t.boolean,
    makeMessageMaker("config.shouldUpdateOutdated"),
  );

  t.assertType(
    __configRaw.shouldCreateNew,
    t.boolean,
    makeMessageMaker("config.shouldCreateNew"),
  );

  t.assertType(
    __configRaw.isAllowedToChangeSnapshots,
    t.boolean,
    makeMessageMaker("config.isAllowedToChangeSnapshots"),
  );

  t.assertType(
    __configRaw.fsDelegate,
    t_FsDelegate,
    makeMessageMaker("config.fsDelegate"),
  );

  t.assertType(
    __configRaw.sourceMaps,
    t.anyObject,
    makeMessageMaker("config.sourceMaps"),
  );

  t.assertType(
    __configRaw.serializers,
    t.array,
    makeMessageMaker("config.serializers"),
  );

  for (let i = 0; i < __configRaw.serializers.length; i++) {
    t.assertType(
      __configRaw.serializers[i],
      t.Function,
      makeMessageMaker(`config.serializers[${i}]`),
    );
  }

  t.assertType(
    __configRaw.parserOptions,
    t.anyObject,
    makeMessageMaker("config.parserOptions"),
  );

  t.assertType(
    __configRaw.updateScheduling,
    t.or(t.exactString("auto"), t.exactString("manual")),
    makeMessageMaker("config.updateScheduling"),
  );

  t.assertType(
    __configRaw.callStructures,
    t.object,
    makeMessageMaker("config.callStructures"),
  );

  t.assertType(
    __configRaw.callStructures.normal,
    t_CallStructure,
    makeMessageMaker("config.callStructures.normal"),
  );

  t.assertType(
    __configRaw.callStructures.forceUpdate,
    t_CallStructure,
    makeMessageMaker("config.callStructures.forceUpdate"),
  );

  t.assertType(
    __configRaw.indentation,
    t.objectWithOnlyTheseProperties({
      tabSize: t.number,
      output: t.or(t.exactString("tabs"), t.exactString("spaces")),
    }),
    makeMessageMaker("config.indentation"),
  );

  t.assertType(
    __configRaw.fallbackLineEnding,
    t.union(t.exactString("\r\n"), t.exactString("\n")),
    makeMessageMaker("config.fallbackLineEnding"),
  );

  return __configRaw;
}
