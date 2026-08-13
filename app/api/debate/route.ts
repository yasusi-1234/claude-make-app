import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import type { DebateEvent } from "@/lib/debate-events";
import { PERSONAS, buildSystemPrompt, type PersonaId } from "@/lib/personas";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-5";
const MAX_TOKENS_PER_TURN = 300;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 5;
const MAX_TOPIC_LENGTH = 200;

interface Turn {
  persona: PersonaId;
  text: string;
}

function encodeEvent(event: DebateEvent): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(event) + "\n");
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "リクエストボディが不正です" }, { status: 400 });
  }

  const { topic: rawTopic, rounds: rawRounds } = body as {
    topic?: unknown;
    rounds?: unknown;
  };

  const topic = typeof rawTopic === "string" ? rawTopic.trim().slice(0, MAX_TOPIC_LENGTH) : "";
  const rounds = Math.min(MAX_ROUNDS, Math.max(MIN_ROUNDS, Math.round(Number(rawRounds)) || 3));

  if (!topic) {
    return Response.json({ error: "お題を入力してください" }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "サーバーに ANTHROPIC_API_KEY が設定されていません" },
      { status: 500 },
    );
  }

  const anthropic = new Anthropic();
  const history: Turn[] = [];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const speak = async (personaId: PersonaId, isSummary = false) => {
        const persona = PERSONAS[personaId];
        controller.enqueue(encodeEvent({ type: "turn-start", persona: personaId }));

        const transcript = history.length
          ? history.map((turn) => `${PERSONAS[turn.persona].name}: ${turn.text}`).join("\n")
          : "(まだ発言はありません)";
        const instruction = isSummary
          ? "司会として、両者の主張を簡潔にまとめてください。"
          : "あなたの発言を出力してください。";
        const userMessage = `お題:「${topic}」\n\nこれまでの討論:\n${transcript}\n\n${instruction}`;

        let full = "";
        const messageStream = anthropic.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS_PER_TURN,
          system: buildSystemPrompt(persona, topic, isSummary),
          messages: [{ role: "user", content: userMessage }],
        });
        for await (const event of messageStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            full += event.delta.text;
            controller.enqueue(
              encodeEvent({ type: "turn-delta", persona: personaId, text: event.delta.text }),
            );
          }
        }
        history.push({ persona: personaId, text: full.trim() });
        controller.enqueue(encodeEvent({ type: "turn-end", persona: personaId }));
      };

      try {
        for (let round = 1; round <= rounds; round++) {
          controller.enqueue(encodeEvent({ type: "round-start", round }));
          await speak("pro");
          await speak("con");
        }
        await speak("moderator", true);
        controller.enqueue(encodeEvent({ type: "done" }));
      } catch (err) {
        controller.enqueue(
          encodeEvent({
            type: "error",
            message: err instanceof Error ? err.message : "討論の生成中にエラーが発生しました",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
