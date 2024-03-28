import util from "util";
import ErrorStackParser from "error-stack-parser";

export function isError(err: unknown): err is Error {
  return (
    typeof err === "object" &&
    err != null &&
    typeof (err as any).name === "string" &&
    typeof (err as any).message === "string"
  );
}

export type ParsedError = {
  name: string;
  message: string;
  stackFrames: Array<ErrorStackParser.StackFrame>;
};

export function parseError(error: unknown): ParsedError {
  if (!isError(error)) {
    return parseError(
      new Error(`Non-Error value was thrown: ${util.inspect(error)}`),
    );
  }

  const stackFrames = ErrorStackParser.parse(error);
  return {
    name: error.name,
    message: error.message,
    stackFrames,
  };
}

export function stackFromParsed(parsedError: ParsedError): string {
  const { name, message, stackFrames } = parsedError;

  const newFrameLines: Array<string> = [];

  for (const frame of stackFrames) {
    let output = "  at ";

    if (frame.isConstructor) {
      output += "new ";
    }

    let fileNameShouldBeWrappedInParens = false;
    if (frame.functionName) {
      output += frame.functionName;
      output += " ";

      fileNameShouldBeWrappedInParens = true;
    }

    if (frame.fileName) {
      if (fileNameShouldBeWrappedInParens) {
        output += "(";
      }

      output += frame.fileName;

      if (frame.lineNumber) {
        output += ":";
        output += frame.lineNumber;

        if (frame.columnNumber) {
          output += ":";
          output += frame.columnNumber;
        }
      }

      if (fileNameShouldBeWrappedInParens) {
        output += ")";
      }
    }

    newFrameLines.push(output);
  }

  return `${name}: ${message}\n${newFrameLines.join("\n")}`;
}

export function errorFromParsed(parsedError: ParsedError): Error {
  const err = new Error(parsedError.message);
  Object.defineProperties(err, {
    name: { value: parsedError.name },
    message: { value: parsedError.message },
    stack: { value: stackFromParsed(parsedError) },
  });
  return err;
}
