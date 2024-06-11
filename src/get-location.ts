import {
  getStackFrame,
  applySourceMapsToStackFrame,
} from "@suchipi/error-utils";
import { validateConfig } from "./config";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/match-inline-snapshot:get-location");

// it's named Loc instead of Location so that TypeScript doesn't mix it up with
// the dom 'Location' class if you forget to import it
export type Loc = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
};

export function getLocation(stackOffsetUpwards: number): Loc | null {
  debug("getting location from stack trace...");

  const config = validateConfig();

  // We add 1 here because the stack offset is from the perspective of the
  // person calling getLocation, but our call to getStackFrame is within
  // getLocation.
  const targetedFrame = getStackFrame(stackOffsetUpwards + 1);
  if (targetedFrame == null) {
    debug("targetedFrame was null");
    return null;
  }

  debug("applying source maps to stack frame...");
  const mappedFrame = applySourceMapsToStackFrame(
    config.sourceMaps,
    targetedFrame,
  );
  const { lineNumber, columnNumber, fileName } = mappedFrame;
  if (fileName == null || lineNumber == null || columnNumber == null) {
    debug("mapped stack frame was missing some data", {
      fileName,
      lineNumber,
      columnNumber,
    });
    return null;
  }

  const loc = {
    fileName,
    lineNumber,
    columnNumber,
  };

  debug("successfully got location", loc);
  return loc;
}
