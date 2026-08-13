"use client";

import { useRef, useState } from "react";
import type { DebateEvent } from "@/lib/debate-events";
import { PERSONAS, type PersonaId } from "@/lib/personas";

type DisplayItem =
  | { kind: "round"; round: number }
  | { kind: "message"; persona: PersonaId; text: string; done: boolean };

type Status = "idle" | "running" | "done" | "error";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [rounds, setRounds] = useState(3);
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startDebate = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || status === "running") return;

    setItems([]);
    setErrorMessage(null);
    setStatus("running");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmedTopic, rounds }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? `リクエストに失敗しました (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          handleEvent(JSON.parse(line) as DebateEvent);
        }
      }

      setStatus((prev) => (prev === "error" ? prev : "done"));
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setErrorMessage(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setStatus("error");
    }
  };

  const handleEvent = (event: DebateEvent) => {
    switch (event.type) {
      case "round-start":
        setItems((prev) => [...prev, { kind: "round", round: event.round }]);
        break;
      case "turn-start":
        setItems((prev) => [...prev, { kind: "message", persona: event.persona, text: "", done: false }]);
        break;
      case "turn-delta":
        setItems((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.kind === "message" && last.persona === event.persona) {
            next[next.length - 1] = { ...last, text: last.text + event.text };
          }
          return next;
        });
        break;
      case "turn-end":
        setItems((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.kind === "message" && last.persona === event.persona) {
            next[next.length - 1] = { ...last, done: true };
          }
          return next;
        });
        break;
      case "error":
        setErrorMessage(event.message);
        setStatus("error");
        break;
      case "done":
        setStatus("done");
        break;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">マルチエージェント討論ルーム</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          お題を入力すると、賛成派・反対派・司会の3人のAIが討論します。
        </p>
      </header>

      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          void startDebate();
        }}
      >
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
          お題
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例: リモートワークは出社より優れている"
            disabled={status === "running"}
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 disabled:opacity-50 dark:border-white/20 dark:focus:border-white/40"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          ラウンド数
          <select
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            disabled={status === "running"}
            className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 disabled:opacity-50 dark:border-white/20 dark:focus:border-white/40"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n} className="text-black">
                {n}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={status === "running" || !topic.trim()}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {status === "running" ? "討論中..." : "討論開始"}
        </button>
      </form>

      {errorMessage && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-1 flex-col gap-3">
        {items.map((item, idx) => {
          if (item.kind === "round") {
            return (
              <div key={idx} className="my-1 text-center text-xs font-medium text-black/40 dark:text-white/40">
                ── ラウンド {item.round} ──
              </div>
            );
          }
          const persona = PERSONAS[item.persona];
          return (
            <div key={idx} className={`rounded-lg border px-4 py-3 ${persona.accent}`}>
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold opacity-70">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px] dark:bg-white/10">
                  {persona.initial}
                </span>
                {persona.name}
                {!item.done && <span className="animate-pulse">…</span>}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.text}</p>
            </div>
          );
        })}
        {status === "idle" && items.length === 0 && (
          <p className="text-sm text-black/40 dark:text-white/40">
            お題を入力して「討論開始」を押すと、ここに討論が表示されます。
          </p>
        )}
      </div>
    </div>
  );
}
