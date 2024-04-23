import chalk from "chalk";
import { diffStringsUnified } from "jest-diff";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/test-snapshot:diff");

const identity = <T>(val: T) => val;

// We use the same colors as jest. They're good colors.

function getSnapshotColor() {
  if (chalk.level === 3) {
    return chalk.rgb(0x80, 0x00, 0x80).bgRgb(0xff, 0xd7, 0xff);
  } else if (chalk.level === 2) {
    return chalk.ansi256(90).bgAnsi256(225);
  } else {
    return chalk.magenta.bgYellowBright;
  }
}

function getReceivedColor() {
  if (chalk.level === 3) {
    return chalk.rgb(0x00, 0x5f, 0x5f).bgRgb(0xd7, 0xff, 0xff);
  } else if (chalk.level === 2) {
    return chalk.ansi256(23).bgAnsi256(195);
  } else {
    return chalk.cyan.bgWhiteBright;
  }
}

export function diff(serializedReceived: string, snapshot: string | undefined) {
  debug("chalk.level:", chalk.level);

  return diffStringsUnified(snapshot || "", serializedReceived, {
    aAnnotation: "Snapshot",
    aColor: getSnapshotColor(),
    bAnnotation: "Received",
    bColor: getReceivedColor(),
    changeLineTrailingSpaceColor: identity,
    commonLineTrailingSpaceColor: chalk.bgYellow,
    emptyFirstOrLastLinePlaceholder: "↵",
    expand: false,
    includeChangeCounts: true,
  });
}
