# `@suchipi/match-inline-snapshot`

A standalone `matchInlineSnapshot` function (like [Jest's](https://jestjs.io/docs/snapshot-testing#inline-snapshots)). You can use it in a different test framework, or without a test framework at all.

## Usage Example

```ts
const { matchInlineSnapshot } = require("@suchipi/match-inline-snapshot");

/* Uncomment the next line to update non-matching snapshots */
// matchInlineSnapshot.config.shouldUpdateOutdated = true;

matchInlineSnapshot(
  `
    something

    mhm
    yeah
  `,
  `
"
    something else

    yeah
  "
`,
); // throws Error or updates self depending on `matchInlineSnapshot.config.shouldUpdateOutdated`
```

## API Documentation

The `@suchipi/match-inline-snapshot` module has the following named exports:

### `matchInlineSnapshot` (Function)

The primary function of this library. Behaves the same as [Jest's `expect(value).toMatchInlineSnapshot(snapshot)`](https://jestjs.io/docs/snapshot-testing#inline-snapshots), except that the call signature is `matchInlineSnapshot(value, snapshot)`.

If the value doesn't match the snapshot, an error will be thrown. To instead update the snapshot, set `matchInlineSnapshot.config.shouldUpdateOutdated` to `true`, or temporarily replace the `matchInlineSnapshot` call with `matchInlineSnapshot.u`.

For more info about `matchInlineSnapshot.config`, see the "Config" heading below.

### `Config` (Type)

The TypeScript type of the value `matchInlineSnapshot.config`, which is the global configuration for this library. The configuration can be changed on-the-fly as needed.

`matchInlineSnapshot.config` has the following properties:

- `shouldUpdateOutdated` (boolean, default false): Whether to update inline snapshots instead of throwing an Error. Analogous to Jest's `--updateSnapshot`/`-u` option.
- `shouldCreateNew` (boolean, default true): Whether to create new snapshots when the second argument to `matchInlineSnapshot` is omitted. You may wish to set this to `false` in CI.
- `isAllowedToChangeSnapshots` (boolean, default true): Whether `matchInlineSnapshot` is allowed to change snapshot content on disk at all, for any reason.
- `fsDelegate` (object): Object containing filesystem functions which will be used to update snapshots. See "FsDelegate" heading below for more info.
- `sourceMaps` (object): Object which you can add source maps onto in order to make snapshots work in TypeScript files and etc.
- `serializers` (Array of Functions): Transforms to pass the input value through in order to arrive at the final snapshot format.
- `parserOptions` (object): Options for the underlying parser, `equivalent-exchange`. See [here](https://github.com/suchipi/equivalent-exchange/blob/70ebd666a2805835cf03efe971a7efd479430600/api/ee-types.d.ts#L11-L73).
- `updateScheduling` (string): Option which controls when snapshot updates get written back to disk. Can be either "auto" or "manual", and defaults to "auto".
  - When the value is "auto", snapshots will be updated shortly after the `matchInlineSnapshot` call(s), in a `setTimeout(..., 0)`.
  - When the value is "manual", snapshots won't be updated until you call `matchInlineSnapshot.flushUpdates`.
- `callStructures` (object): Option which controls which AST code structures will be targeted by the update system.
  By default, it looks for code like:
  ```ts
  matchInlineSnapshot(something, somethingElse);
  ```
  but you could configure this option to make it instead look for (as an example):
  ```ts
  expect(something).toMatchInlineSnapshot(somethingElse);
  ```
  See "CallStructure" heading below for more info.
- `indentation` (object): Options which control how indentation is interpreted by the library. The following properties are present:
  - `tabSize` (number): The character width that `matchInlineSnapshot` should use for tabs, for the purpose of indentation calculations. Defaults to **2**.
  - `output` (string): Whether snapshots should be indented using tabs or spaces. Valid values are `"tabs"` or `"spaces"`. Defaults to **"spaces"**.

### `FsDelegate` (Type)

The TypeScript type of the value `matchInlineSnapshot.config.fsDelegate`, which is an object containing synchronous functions which get used by `matchInlineSnapshot` in order to update snapshot content on disk.

The default value of `matchInlineSnapshot.config.fsDelegate` uses Node.js's builtin `fs` module. If you wish, you may replace `matchInlineSnapshot.config.fsDelegate` with your own `FsDelegate`.

An `FsDelegate` has the following functions:

```ts
type FsDelegate = {
  /* Used to read source code in order to find inline snapshot calls */
  readFileAsUtf8(filename: string): string;
  /* Used to write back modified source code in order to update inline snapshots */
  writeUtf8ToFile(filename: string, content: string): void;
};
```

### `CallStructure` (Type)

A TypeScript type used by `matchInlineSnapshot.config.callStructures`, which is an object containing AST patterns that the system should detect as match-inline-snapshot calls.

`matchInlineSnapshot.config.callStructures` is an object with two properties, `normal` and `forceUpdate`, which are `CallStructure`s describing the AST pattern of a normal matchInlineSnapshot call and a force-update matchInlineSnapshot call, respectively.

If you wrap `matchInlineSnapshot` calls in a helper function, you can change `matchInlineSnapshot.config.callStructures` such that the system targets your wrapper function instead of the wrapped `matchInlineSnapshot` call. The primary use-case for this is integrating `matchInlineSnapshot` with "expect" or "assert" helpers.

Each `CallStructure` has the following properties:

````ts
export type CallStructure = {
  /**
   * The AST pattern which represents a match-inline-snapshot call.
   *
   * By default, this is:
   *
   * ```json
   * {
   *   type: "CallExpression",
   *   callee: {
   *     type: "Identifier",
   *     name: "matchInlineSnapshot"
   *   }
   * }
   * ```
   *
   * You can change this to make the snapshot update system target a different
   * code pattern.
   */
  astPattern: { [key: string]: any };

  /**
   * The property path to the snapshot node, starting from the
   * configured `astPattern`.
   *
   * By default, this is `["arguments", 1]`.
   *
   * This controls where the snapshot template literal string gets placed.
   */
  snapshotPath: Array<string | number>;

  /**
   * How many call stack frames away the call-structure-to-update is from the
   * actual library `matchInlineSnapshot` call.
   *
   * If you wrap `matchInlineSnapshot` in a helper method, you'll need to
   * increase this number.
   *
   * Defaults to `0` (ie. the call-to-update is the same as the call to the library).
   */
  stackOffset: number;
};
````

## License

MIT
