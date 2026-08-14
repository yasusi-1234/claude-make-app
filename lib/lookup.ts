import { getDb } from "./db";
import type { PriceQuote, ProductLookupResult } from "./lookup-types";
import type { ShopId } from "./shops";

export async function lookupProduct(barcode: string): Promise<ProductLookupResult | null> {
  const db = await getDb();

  const productResult = await db.execute({
    sql: "SELECT barcode, name, category FROM products WHERE barcode = ?",
    args: [barcode],
  });
  const productRow = productResult.rows[0];
  if (!productRow) return null;

  const priceResult = await db.execute({
    sql: "SELECT shop, price, url, scraped_at AS scrapedAt FROM prices WHERE barcode = ? ORDER BY price DESC",
    args: [barcode],
  });

  const prices: PriceQuote[] = priceResult.rows.map((row) => ({
    shop: row.shop as ShopId,
    price: Number(row.price),
    url: (row.url as string | null) ?? null,
    scrapedAt: row.scrapedAt as string,
  }));

  return {
    barcode: productRow.barcode as string,
    name: productRow.name as string,
    category: (productRow.category as string | null) ?? null,
    prices,
  };
}
