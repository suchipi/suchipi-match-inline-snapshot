matchInlineSnapshot.config.shouldCreateNew = false;

function tryAndLog(cb) {
  try {
    cb();
  } catch (err) {
    console.error(err);
  }
}

tryAndLog(() => {
  matchInlineSnapshot({ a: true });
});

tryAndLog(() => {
  matchInlineSnapshot({ a: true }, "4");
});

tryAndLog(() => {
  matchInlineSnapshot.u(
    { b: true },
    `
  Object {}
  `,
  );
});
