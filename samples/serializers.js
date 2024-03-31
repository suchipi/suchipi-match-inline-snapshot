const { matchInlineSnapshot } = require("..");

/* Uncomment the next line to update non-matching snapshots */
matchInlineSnapshot.config.shouldUpdateOutdated = true;

matchInlineSnapshot(
  { a: "b" },
  `
Object {
  "a": "b",
}
`,
);
