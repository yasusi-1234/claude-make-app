import { getDb } from "./db";
import type { PriceQuote, ProductLookupResult } from "./lookup-types";

interface ProductRow {
  barcode: string;
  name: string;
  category: string | null;
}

export function lookupProduct(barcode: string): ProductLookupResult | null {
  const db = getDb();
  const product = db
    .prepare("SELECT barcode, name, category FROM products WHERE barcode = ?")
    .get(barcode) as ProductRow | undefined;
  if (!product) return null;

  const prices = db
    .prepare(
      "SELECT shop, price, url, scraped_at AS scrapedAt FROM prices WHERE barcode = ? ORDER BY price DESC",
    )
    .all(barcode) as PriceQuote[];

  return { ...product, prices };
}
