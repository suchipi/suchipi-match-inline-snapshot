type EOL = "\r\n" | "\n\r" | "\n" | "\r";

export function detectEOL<Fallback extends EOL | null>(
  str: string,
  // @ts-ignore could be instantiated with different subtype
  fallback: Fallback = null,
): EOL | Fallback {
  const scores = {
    "\r\n": 0,
    "\n\r": 0,
    "\n": 0,
    "\r": 0,
  } satisfies Record<EOL, number>;

  const len = str.length;
  for (let i = 0; i < len; i++) {
    const curr = str[i];
    const next = str[i + 1] ?? null;
    if (next !== null) {
      if (curr === "\r" && next === "\n") {
        scores["\r\n"]++;
        i++;
        continue;
      } else if (curr === "\n" && next === "\r") {
        scores["\n\r"]++;
        i++;
        continue;
      }
    }

    if (curr === "\n") {
      scores["\n"]++;
      continue;
    } else if (curr === "\r") {
      scores["\r"]++;
      continue;
    }
  }

  if (
    scores["\r"] === scores["\r\n"] &&
    scores["\r\n"] === scores["\n"] &&
    scores["\n"] === scores["\n\r"]
  ) {
    return fallback;
  }

  const largestPair = (Object.entries(scores) as Array<[EOL, number]>).reduce(
    (prev: null | [EOL, number], curr: [EOL, number]) => {
      if (prev === null) {
        return curr;
      }

      if (curr[1] >= prev[1]) {
        return curr;
      } else {
        return prev;
      }
    },
    null,
  );

  return largestPair![0];
}
