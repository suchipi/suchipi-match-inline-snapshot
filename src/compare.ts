import { validateConfig } from "./config";

import makeDebug from "debug";
const debug = makeDebug("@suchipi/test-snapshot:compare");

export type Outcome = "new" | "pass" | "fail";

export function compare(
  rawReceivedValue: any,
  snapshot: string | undefined,
): { serializedReceived: string; outcome: Outcome } {
  debug("compare called");

  const config = validateConfig();

  debug("running snapshot serializers");
  let serializedReceived = config.serializers.reduce(
    (prev, serializer) => serializer(prev),
    rawReceivedValue,
  );
  if (typeof serializedReceived !== "string") {
    serializedReceived = String(serializedReceived);
  }

  debug("comparing snapshot");
  let outcome: Outcome;
  if (typeof snapshot === "undefined") {
    outcome = "new";
  } else if (serializedReceived === snapshot) {
    outcome = "pass";
  } else {
    outcome = "fail";
  }

  debug("comparison result:", outcome);

  return { serializedReceived, outcome };
}
