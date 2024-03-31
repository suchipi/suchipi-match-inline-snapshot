const { matchInlineSnapshot } = require("..");

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
