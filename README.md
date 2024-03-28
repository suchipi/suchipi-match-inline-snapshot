# `@suchipi/test-snapshot`

A standalone `matchInlineSnapshot` function (like [Jest's](https://jestjs.io/docs/snapshot-testing#inline-snapshots)). You can use it in a different test framework, or without a test framework at all.

## Usage Example

```ts
import { matchInlineSnapshot } from "@suchipi/test-snapshot";

/* Uncomment the next line to update non-matching snapshots */
// matchInlineSnapshot.config.shouldUpdateOutdated = true;

matchInlineSnapshot(
  `
    something
  `,
  `
    something else

    yeah
  `,
); // throws Error or updates self depending on `matchInlineSnapshot.config.shouldUpdateOutdated`
```
