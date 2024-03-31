# `@suchipi/test-snapshot`

A standalone `matchInlineSnapshot` function (like [Jest's](https://jestjs.io/docs/snapshot-testing#inline-snapshots)). You can use it in a different test framework, or without a test framework at all.

## Usage Example

```ts
const { matchInlineSnapshot } = require("@suchipi/test-snapshot");

/* Uncomment the next line to update non-matching snapshots */
// matchInlineSnapshot.config.shouldUpdateOutdated = true;

matchInlineSnapshot(
  `
    something

    mhm
    yeah
  `,
  `
    something else

    yeah
  `,
); // throws Error or updates self depending on `matchInlineSnapshot.config.shouldUpdateOutdated`
```

## API Documentation

The `@suchipi/test-snapshot` module has the following named exports:

### `matchInlineSnapshot` (Function)

The primary function of this library. Behaves the same as [Jest's `expect(value).toMatchInlineSnapshot(snapshot)`](https://jestjs.io/docs/snapshot-testing#inline-snapshots), except that the call signature is `matchInlineSnapshot(value, snapshot)`.

If the value doesn't match the snapshot, an error will be thrown. To instead update the snapshot, set `matchInlineSnapshot.config.shouldUpdateOutdated` to `true`.

For more info about `matchInlineSnapshot.config`, see the "Config" heading below.

### `Config` (Type)

The TypeScript type of the value `matchInlineSnapshot.config`, which is the global configuration for this library. The configuration can be changed on-the-fly as needed.

`matchInlineSnapshot.config` has the following properties:

- `shouldUpdateOutdated` (boolean, default false): Whether to update inline snapshots instead of throwing an Error. Analogous to Jest's `--updateSnapshot`/`-u` option.
- `shouldCreateNew` (boolean, default true): Whether to create new snapshots when the second argument to `matchInlineSnapshot` is omitted. You may wish to set this to `false` in CI.
- `isAllowedToChangeSnapshots` (boolean, default true): Whether `matchInlineSnapshot` is allowed to change snapshot content on disk at all, for any reason.
- `fsDelegate` (object): Object containing filesystem functions which will be used to update snapshots. See "FsDelegate" heading below for more info.
- `sourceMaps` (object): Object which you can add source maps onto in order to make snapshots work in TypeScript files and etc.

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

## License

MIT
