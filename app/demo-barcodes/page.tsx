"use client";

import JsBarcode from "jsbarcode";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SAMPLE_PRODUCTS } from "@/lib/sample-products";

function BarcodeSvg({ value }: { value: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    JsBarcode(ref.current, value, {
      format: "EAN13",
      width: 2,
      height: 70,
      displayValue: true,
      margin: 8,
    });
  }, [value]);

  return <svg ref={ref} className="w-full max-w-xs" />;
}

export default function DemoBarcodesPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">デモ用バーコード一覧</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          このバーコードをスマホのカメラで読み取ると、
          <Link href="/" className="underline underline-offset-2">
            スキャン画面
          </Link>
          でサンプルの買取価格が表示されます(実データではありません)。
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SAMPLE_PRODUCTS.map((product) => (
          <div
            key={product.barcode}
            className="flex flex-col items-center gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15"
          >
            <p className="text-center text-sm font-medium">{product.name}</p>
            <BarcodeSvg value={product.barcode} />
          </div>
        ))}
      </div>
    </div>
  );
}
