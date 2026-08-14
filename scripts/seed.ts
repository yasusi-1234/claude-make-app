import type { InStatement } from "@libsql/client";
import { getDb } from "../lib/db";
import { SAMPLE_PRODUCTS } from "../lib/sample-products";

async function main() {
  const db = await getDb();
  const scrapedAt = new Date().toISOString();

  const statements: InStatement[] = [];
  for (const product of SAMPLE_PRODUCTS) {
    statements.push({
      sql: `INSERT INTO products (barcode, name, category) VALUES (?, ?, ?)
            ON CONFLICT(barcode) DO UPDATE SET name = excluded.name, category = excluded.category`,
      args: [product.barcode, product.name, product.category],
    });
    statements.push({
      sql: `DELETE FROM prices WHERE barcode = ?`,
      args: [product.barcode],
    });
    for (const price of product.prices) {
      statements.push({
        sql: `INSERT INTO prices (barcode, shop, price, url, scraped_at) VALUES (?, ?, ?, ?, ?)`,
        args: [product.barcode, price.shop, price.price, price.url, scrapedAt],
      });
    }
  }

  await db.batch(statements, "write");
  console.log(
    `Seeded ${SAMPLE_PRODUCTS.length} products into ${process.env.TURSO_DATABASE_URL ? "Turso" : "data/store.db"}`,
  );
}

main();
