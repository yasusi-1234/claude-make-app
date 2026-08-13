import type { ShopId } from "../shops";

export interface ScrapeTarget {
  shopId: ShopId;
  /** バーコード(JANコード)から検索結果ページのURLを組み立てる */
  searchUrl(barcode: string): string;
}

/**
 * 検索URLのパターンは未検証。この開発環境からは対象サイトへの
 * アクセスがネットワークポリシーでブロックされていて、実際の
 * 検索窓の挙動を確認できないまま組んでいる。
 *
 * 実行前に、実際のブラウザで各サイトの検索窓にJANコードを1件入力し、
 * 遷移後のURLと照らし合わせてここを修正すること。
 */
export const SCRAPE_TARGETS: ScrapeTarget[] = [
  {
    shopId: "suruga-ya",
    searchUrl: (barcode) =>
      `https://www.suruga-ya.jp/search?category=&search_word=${encodeURIComponent(barcode)}`,
  },
  {
    shopId: "bookoff",
    searchUrl: (barcode) =>
      `https://www.bookoffonline.co.jp/search/?keyword=${encodeURIComponent(barcode)}`,
  },
];
