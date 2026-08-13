import type { ShopId } from "./shops";

export interface SamplePriceEntry {
  shop: ShopId;
  price: number;
  url: string;
}

export interface SampleProduct {
  barcode: string;
  name: string;
  category: string;
  prices: SamplePriceEntry[];
}

/**
 * ダミーデータ。バーコードは実在の商品に紐付いておらず、
 * 価格・URLも架空の値。デモ用の @/app/demo-barcodes ページで
 * このバーコードを画面表示してスキャンの動作確認に使う。
 * 実データに差し替える場合は scripts/seed.ts の取得元をこの配列と
 * 同じ形に整形して渡す。
 */
export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    barcode: "4900000000016",
    name: "サンプル漫画『冒険の書』1巻",
    category: "コミック",
    prices: [
      { shop: "bookoff", price: 220, url: "https://example.com/bookoff/sample-1" },
      { shop: "suruga-ya", price: 280, url: "https://example.com/suruga-ya/sample-1" },
    ],
  },
  {
    barcode: "4900000000023",
    name: "サンプルRPG『幻想ダンジョン記』(PS5)",
    category: "ゲームソフト",
    prices: [
      { shop: "bookoff", price: 3200, url: "https://example.com/bookoff/sample-2" },
      { shop: "suruga-ya", price: 3800, url: "https://example.com/suruga-ya/sample-2" },
    ],
  },
  {
    barcode: "4900000000030",
    name: "サンプル小説『夜明けの向こう側』",
    category: "文庫本",
    prices: [
      { shop: "bookoff", price: 110, url: "https://example.com/bookoff/sample-3" },
      { shop: "suruga-ya", price: 150, url: "https://example.com/suruga-ya/sample-3" },
    ],
  },
  {
    barcode: "4900000000047",
    name: "サンプルBlu-ray『銀河紀行』",
    category: "映像ソフト",
    prices: [
      { shop: "bookoff", price: 1500, url: "https://example.com/bookoff/sample-4" },
      { shop: "suruga-ya", price: 1300, url: "https://example.com/suruga-ya/sample-4" },
    ],
  },
  {
    barcode: "4900000000054",
    name: "サンプルフィギュア『勇者エルナ』",
    category: "ホビー",
    prices: [
      { shop: "bookoff", price: 4200, url: "https://example.com/bookoff/sample-5" },
      { shop: "suruga-ya", price: 5100, url: "https://example.com/suruga-ya/sample-5" },
    ],
  },
  {
    barcode: "4900000000061",
    name: "サンプルカードゲーム拡張パック『星霜の刻』",
    category: "トレーディングカード",
    prices: [
      { shop: "bookoff", price: 680, url: "https://example.com/bookoff/sample-6" },
      { shop: "suruga-ya", price: 900, url: "https://example.com/suruga-ya/sample-6" },
    ],
  },
];
