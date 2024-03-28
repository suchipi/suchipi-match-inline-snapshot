import dedent from "dedent";
import { Loc, getLocation } from "./get-location";
import { update } from "./update";

export function match(actual: string, expected: string = ""): void {
  const callerLocation = getLocation(1);
  if (callerLocation == null) {
    throw new Error("Could not determine caller location");
  }

  const dedentedActual = dedent("\n" + actual + "\n");
  const dedentedExpected = dedent("\n" + expected + "\n");

  const result = matchInner(callerLocation, dedentedActual, dedentedExpected);

  switch (result.outcome) {
    case "new": {
      result.update();
      break;
    }
    case "pass": {
      break;
    }
    case "fail": {
      const message = [
        "Snapshots didn't match.",
        "",
        "Expected:",
        expected,
        "",
        "Actual:",
        actual,
      ].join("\n");
      throw new Error(message);
    }
  }
}

export type Result = {
  actual: string;
  expected: string | undefined;
  outcome: "pass" | "fail" | "new";
  update(): void;
};

function matchInner(
  callerLocation: Loc,
  actual: string,
  expected: string,
): Result {
  if (!expected) {
    return {
      outcome: "new",
      actual,
      expected,
      update: () => {
        update(callerLocation, actual);
      },
    };
  }

  if (actual === expected) {
    return {
      outcome: "pass",
      actual,
      expected,
      update: () => {},
    };
  } else {
    return {
      outcome: "fail",
      actual,
      expected,
      update: () => {
        update(callerLocation, actual);
      },
    };
  }
}
