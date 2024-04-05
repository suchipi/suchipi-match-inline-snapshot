import {
  getStackFrame,
  applySourceMapsToStackFrame,
} from "@suchipi/error-utils";
import { config } from "./config";
import { changeMaps } from "./change-maps";

// it's named Loc instead of Location so that TypeScript doesn't mix it up with
// the dom 'Location' class if you forget to import it
export type Loc = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
};

export function getLocation(stackOffsetUpwards: number): Loc | null {
  // We add 1 here because the stack offset is from the perspective of the
  // person calling getLocation, but our call to getStackFrame is within
  // getLocation.
  const targetedFrame = getStackFrame(stackOffsetUpwards + 1);
  if (targetedFrame == null) {
    return null;
  }
  const sourceMappedFrame = applySourceMapsToStackFrame(
    config.sourceMaps,
    targetedFrame,
  );
  let { lineNumber, columnNumber, fileName } = sourceMappedFrame;
  if (fileName == null || lineNumber == null || columnNumber == null) {
    return null;
  }

  const changeMap = changeMaps.get(fileName);
  if (changeMap != null) {
    const changeMappedFrame = applySourceMapsToStackFrame(
      { [fileName]: changeMap },
      sourceMappedFrame,
    );
    console.log("change mapped frame: ", changeMappedFrame);
    lineNumber = changeMappedFrame.lineNumber;
    columnNumber = changeMappedFrame.columnNumber;

    if (lineNumber == null || columnNumber == null) {
      return null;
    }
  }

  return {
    fileName,
    lineNumber,
    columnNumber,
  };
}
