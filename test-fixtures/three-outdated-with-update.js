matchInlineSnapshot({ a: true });

matchInlineSnapshot(
  { b: true },
  `
Object {}
`,
);
matchInlineSnapshot.flushUpdates();

// this one fucks up the previous one due to previous snapshots changing the
// line number of this call. that's just a casualty of how manual update
// flushing works
matchInlineSnapshot({ c: true });

matchInlineSnapshot.flushUpdates();
