import type { PersonaId } from "./personas";

const PRO_LINES = (topic: string) => [
  `「${topic}」には明確なメリットがあります。効率や柔軟性の面で優れている点は無視できません。`,
  `反対派の懸念は理解できますが、適切な運用をすればリスクは十分に軽減できるはずです。`,
  `実際の事例を見ても、うまく取り入れられているケースは少なくありません。`,
  `長期的に見れば、得られる利益の方がコストを上回ると考えます。`,
  `慎重になりすぎることで、得られたはずの機会を逃すことこそ避けるべきです。`,
];

const CON_LINES = (topic: string) => [
  `「${topic}」には見過ごせないリスクがあります。全員が同じ条件でメリットを享受できるとは限りません。`,
  `賛成派の主張は理想論に近く、現場の実態を十分に踏まえていないように感じます。`,
  `導入コストや副作用を考えると、慎重に判断すべきだと思います。`,
  `代替案を十分に検討しないまま結論を急ぐのは危険です。`,
  `メリットが大きいからこそ、失敗したときの影響も大きくなることを忘れてはいけません。`,
];

const MOCK_SUFFIX = "(※モックモードのため定型文です。実際のAI生成ではありません)";

export function mockLine(persona: PersonaId, topic: string, round: number): string {
  if (persona === "moderator") {
    return `「${topic}」について、賛成派はメリットや効率性を、反対派はリスクや実態とのギャップを主張しました。双方の意見には一理あり、今後は具体的な条件やケースに応じた判断が求められそうです。${MOCK_SUFFIX}`;
  }
  const lines = persona === "pro" ? PRO_LINES(topic) : CON_LINES(topic);
  return lines[(round - 1) % lines.length];
}
