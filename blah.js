const { matchInlineSnapshot } = require(".");

matchInlineSnapshot.config.shouldUpdateOutdated = true;

matchInlineSnapshot({ a: true });

matchInlineSnapshot(
  { b: true },
  `
Object {}
`,
);
