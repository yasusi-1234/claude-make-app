"use client";

import Link from "next/link";
import { useCallback, useState, type FormEvent } from "react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { isValidEan13 } from "@/lib/ean13";
import type { ProductLookupResult } from "@/lib/lookup-types";
import { SHOPS } from "@/lib/shops";

type Status = "idle" | "scanning" | "loading" | "found" | "not-found" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [result, setResult] = useState<ProductLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");

  const lookup = useCallback(async (barcode: string) => {
    setScannedCode(barcode);
    setStatus("loading");
    try {
      const res = await fetch(`/api/lookup?barcode=${encodeURIComponent(barcode)}`);
      if (res.status === 404) {
        setResult(null);
        setStatus("not-found");
        return;
      }
      if (!res.ok) {
        throw new Error(`検索に失敗しました (${res.status})`);
      }
      const data = (await res.json()) as ProductLookupResult;
      setResult(data);
      setStatus("found");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "予期しないエラーが発生しました");
      setStatus("error");
    }
  }, []);

  const handleDetected = useCallback(
    (code: string) => {
      void lookup(code);
    },
    [lookup],
  );

  const startScan = () => {
    setResult(null);
    setScannedCode(null);
    setErrorMessage(null);
    setStatus("scanning");
  };

  const submitManualBarcode = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = manualBarcode.trim();
    if (!trimmed) return;
    if (!isValidEan13(trimmed)) {
      setErrorMessage("13桁のEAN/JANコードとして正しくありません(チェックデジット不一致)。");
      setStatus("error");
      return;
    }
    void lookup(trimmed);
  };

  const bestPrice = result?.prices[0];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">バーコード買取価格チェッカー</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          商品のバーコードをスキャンすると、買取店ごとの想定価格を比較表示します。
        </p>
      </header>

      <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        現在はダミーのサンプルデータのみです。実際の買取店の相場ではありません。動作確認には{" "}
        <Link href="/demo-barcodes" className="underline underline-offset-2">
          デモ用バーコード一覧
        </Link>{" "}
        の画面をスマホで映してスキャンしてください。
      </p>

      {status !== "scanning" && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <button
            type="button"
            onClick={startScan}
            className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition dark:bg-white dark:text-black"
          >
            スキャン開始
          </button>

          <form onSubmit={submitManualBarcode} className="flex flex-1 gap-2">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium">
              バーコードを直接入力
              <input
                type="text"
                inputMode="numeric"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="例: 4900000000016"
                className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/40"
              />
            </label>
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="self-end rounded-md border border-black/15 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-white/20"
            >
              検索
            </button>
          </form>
        </div>
      )}

      {status === "scanning" && (
        <div className="flex flex-col gap-3">
          <BarcodeScanner active={status === "scanning"} onDetected={handleDetected} />
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="self-start rounded-md border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
          >
            キャンセル
          </button>
        </div>
      )}

      {status === "loading" && <p className="text-sm text-black/60 dark:text-white/60">検索中...</p>}

      {status === "error" && errorMessage && (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          {errorMessage}
        </p>
      )}

      {status === "not-found" && scannedCode && (
        <div className="rounded-md border border-black/10 px-4 py-3 text-sm dark:border-white/15">
          バーコード <span className="font-mono">{scannedCode}</span>{" "}
          のデータが見つかりませんでした。サンプルデータに含まれる商品ではない可能性があります。
        </div>
      )}

      {status === "found" && result && (
        <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15">
          <div>
            <p className="text-xs text-black/50 dark:text-white/50">
              {result.category ?? "カテゴリ不明"} / バーコード: {result.barcode}
            </p>
            <h2 className="text-lg font-semibold">{result.name}</h2>
          </div>

          <ul className="flex flex-col gap-2">
            {result.prices.map((price) => (
              <li
                key={price.shop}
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                  price.shop === bestPrice?.shop
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                    : "border-black/10 dark:border-white/15"
                }`}
              >
                <span className="font-medium">
                  {SHOPS[price.shop].name}
                  {price.shop === bestPrice?.shop && (
                    <span className="ml-2 rounded bg-emerald-600 px-1.5 py-0.5 text-xs text-white">
                      最高額
                    </span>
                  )}
                </span>
                <span className="font-mono">¥{price.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-black/40 dark:text-white/40">
            ※ダミーデータです。取得日時: {new Date(result.prices[0]?.scrapedAt ?? "").toLocaleString("ja-JP")}
          </p>
        </div>
      )}
    </div>
  );
}
