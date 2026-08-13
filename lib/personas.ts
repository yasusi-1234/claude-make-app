export type PersonaId = "pro" | "con" | "moderator";

export interface Persona {
  id: PersonaId;
  name: string;
  stance: string;
  initial: string;
  accent: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  pro: {
    id: "pro",
    name: "賛成派",
    stance:
      "お題に対して賛成の立場を取り、賛成する理由やメリットを具体的に主張してください。",
    initial: "賛",
    accent:
      "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100",
  },
  con: {
    id: "con",
    name: "反対派",
    stance:
      "お題に対して反対の立場を取り、反対する理由やリスクを具体的に主張してください。",
    initial: "反",
    accent:
      "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-100",
  },
  moderator: {
    id: "moderator",
    name: "司会",
    stance: "中立的な立場で議論を進行し、最後に両者の主張を簡潔にまとめてください。",
    initial: "司",
    accent:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  },
};

export function buildSystemPrompt(persona: Persona, topic: string, isSummary = false): string {
  const base = `あなたは討論会の「${persona.name}」役です。お題は「${topic}」です。\n${persona.stance}`;
  const style = isSummary
    ? "発言は日本語で3〜5文程度。賛成派・反対派それぞれの主張の要点を簡潔にまとめてください。"
    : "発言は日本語で2〜4文程度、簡潔にまとめてください。これまでの討論があれば、直前の相手の発言を踏まえて反論や補足をしてください。";
  return `${base}\n${style}\n自己紹介や前置き、括弧書きのト書きは不要です。発言内容だけをそのまま出力してください。`;
}
