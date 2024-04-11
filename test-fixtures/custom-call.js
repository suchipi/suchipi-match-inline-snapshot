const stuff = {
  match(snapshot, options, value = 5) {
    matchInlineSnapshot(value, snapshot);
  },
};

stuff.match();

// anotha one
stuff.match("9", {});

// anotha one
stuff.match("", {}, 57);
