// new
matchInlineSnapshot({ a: true });

// intentional double-empty-line below:


// outdated
matchInlineSnapshot(
  { b: true },
  `
Object {}
`,
);

// up-to-date
matchInlineSnapshot(
  { c: false },
  `
Object {
  c: false,
}
`,
);
