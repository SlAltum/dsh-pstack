import { describe, expect, it } from "vite-plus/test";
import { validateStoredEvents } from "@deepseek-ai/dsh-session-persistence";
import type { SessionEvent, SessionHeader } from "@deepseek-ai/dsh-session";
import { POTETO_MODE_RECORD } from "../src/poteto/projection.ts";

const header = {
  version: 4,
  id: "session-00000000-0000-4000-8000-000000000000",
  createdAt: 1_700_000_000_000,
} as unknown as SessionHeader;

/** A stored row the way a backend decodes it, before admission. */
const stored = (fields: Record<string, unknown>) =>
  ({
    seq: 1,
    time: 1_700_000_000_000,
    data: { enabled: true },
    ...fields,
  }) as unknown as SessionEvent;

describe("the poteto switch as a persisted record", () => {
  it("passes storage admission as a plugin record", () => {
    const admitted = validateStoredEvents(header, [
      stored({ type: POTETO_MODE_RECORD, ignorable: true }),
    ]);

    expect(admitted).toHaveLength(1);
  });

  it("refuses the retired poteto/mode row without the ignorable marker", () => {
    expect(() => validateStoredEvents(header, [stored({ type: "poteto/mode" })])).toThrow(
      /unknown to this harness/,
    );
  });
});
