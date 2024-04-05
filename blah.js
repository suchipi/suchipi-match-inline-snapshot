const { matchInlineSnapshot } = require(".");

matchInlineSnapshot.config.shouldUpdateOutdated = true;

matchInlineSnapshot(
  { a: true },
  `
Object {
  "a": true,
}
`,
);

matchInlineSnapshot(
  { b: true },
  `
Object {}
`,
);
