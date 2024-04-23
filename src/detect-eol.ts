export function detectEOL(str: string): string | null {
  const len = str.length;
  for (let i = 0; i < len; i++) {
    const currentChar = str[i];
    const nextChar = str[i + 1] ?? "";
    if (currentChar === "\r" && nextChar === "\n") {
      return "\r\n";
    } else if (currentChar === "\n" && nextChar === "\r") {
      return "\n\r";
    } else if (currentChar === "\n") {
      return "\n";
    } else if (currentChar === "\r") {
      return "\r";
    }
  }

  return null;
}
