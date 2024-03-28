import ErrorStackParser from "error-stack-parser";

// it's named Loc instead of Location so that TypeScript doesn't mix it up with
// the dom 'Location' class if you forget to import it
export type Loc = {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
};

export function getLocation(stackOffsetUpwards: number): Loc | null {
  const here = new Error("inside getLocation");
  const frames = ErrorStackParser.parse(here);

  // We add 1 here because the stack offset is from the perspective of the
  // person calling getLocation, but the Error was created within getLocation.
  const targetedFrame = frames[stackOffsetUpwards + 1];
  if (targetedFrame == null) {
    return null;
  }
  const { lineNumber, columnNumber, fileName } = targetedFrame;
  if (fileName == null || lineNumber == null || columnNumber == null) {
    return null;
  }

  return {
    fileName,
    lineNumber,
    columnNumber,
  };
}
