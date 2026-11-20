/** Durable poteto-workflow selection projected from Session events. */

import { z } from "zod";
import type { ProjectionDefinition } from "@deepseek-ai/dsh-session-projection";
import { pluginRecordOf } from "@deepseek-ai/dsh-session";
import type { PluginRecordMap, SessionEvent } from "@deepseek-ai/dsh-session";

/** Plugin record type carrying one Session's poteto selection. */
export const POTETO_MODE_RECORD = "plugin:pstack/poteto-mode";

declare module "@deepseek-ai/dsh-session" {
  interface PluginRecordMap {
    "plugin:pstack/poteto-mode": { enabled: boolean };
  }
}

declare module "@deepseek-ai/dsh-session-projection/types" {
  interface SessionProjectionMap {
    /** Saved poteto-workflow selection of the projected Session. */
    potetoMode: PotetoModeView;
  }
}

export interface PotetoProjectionState {
  readonly enabled?: boolean;
}

/** Client view of one Session's poteto selection. */
export interface PotetoModeView {
  readonly enabled: boolean;
}

const stateSchema = z
  .object({ enabled: z.boolean().optional() })
  .strict() as z.ZodType<PotetoProjectionState>;
const eventSchema = z.object({ enabled: z.boolean() }).strict() as z.ZodType<
  PluginRecordMap[typeof POTETO_MODE_RECORD]
>;
const viewSchema = z.object({ enabled: z.boolean() }).strict() as z.ZodType<PotetoModeView>;

/** Reuse the wire value so an unchanged selection publishes nothing. */
const ENABLED_VIEW: PotetoModeView = { enabled: true };
const DISABLED_VIEW: PotetoModeView = { enabled: false };

/** Persisted selection for one root Session. */
export const potetoProjectionDefinition = {
  key: "potetoMode",
  stateVersion: 2,
  stateSchema,
  init: () => ({}),
  apply: (state: PotetoProjectionState, event: SessionEvent) => {
    const record = pluginRecordOf(event);
    if (record?.type !== POTETO_MODE_RECORD) return state;
    const parsed = eventSchema.safeParse(record.data);
    return parsed.success ? { ...state, ...parsed.data } : state;
  },
  wire: {
    viewSchema,
    view: (state: PotetoProjectionState) => (state.enabled === true ? ENABLED_VIEW : DISABLED_VIEW),
  },
} satisfies ProjectionDefinition<"potetoMode", PotetoProjectionState>;
