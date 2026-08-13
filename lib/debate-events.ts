import type { PersonaId } from "./personas";

export type DebateEvent =
  | { type: "round-start"; round: number }
  | { type: "turn-start"; persona: PersonaId }
  | { type: "turn-delta"; persona: PersonaId; text: string }
  | { type: "turn-end"; persona: PersonaId }
  | { type: "done" }
  | { type: "error"; message: string };
