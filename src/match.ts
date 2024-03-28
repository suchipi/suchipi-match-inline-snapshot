import { getLocation } from "./get-location";
import { update } from "./update";

export const matchConfig: {
  shouldUpdate: boolean;
  isCI: boolean;
} = {
  shouldUpdate: false,
  isCI: false,
};

export function match(actual: string, expected: string | undefined): void {
  const callerLocation = getLocation(1);
  if (callerLocation == null) {
    throw new Error("Could not determine caller location");
  }

  let outcome: "new" | "pass" | "fail";
  if (typeof expected === "undefined") {
    outcome = "new";
  } else if (actual === expected) {
    outcome = "pass";
  } else {
    outcome = "fail";
  }

  switch (outcome) {
    case "new": {
      if (matchConfig.isCI) {
        throw new Error(
          "Attempting to create new snapshot in CI. This is probably a mistake.",
        );
      } else {
        update(callerLocation, actual);
      }
      break;
    }
    case "pass": {
      if (!matchConfig.isCI) {
        // It's equivalent, but we still call update in order to, for example,
        // change the second arg from a string literal to a template literal.
        update(callerLocation, actual);
      }
      break;
    }
    case "fail": {
      if (matchConfig.shouldUpdate) {
        update(callerLocation, actual);
      } else {
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
}

export type Result = {
  outcome: "pass" | "fail" | "new";
  update(): void;
};
