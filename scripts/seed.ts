import { getDb } from "../lib/db";
import { SAMPLE_PRODUCTS } from "../lib/sample-products";

const db = getDb();

const upsertProduct = db.prepare(
  `INSERT INTO products (barcode, name, category) VALUES (@barcode, @name, @category)
   ON CONFLICT(barcode) DO UPDATE SET name = excluded.name, category = excluded.category`,
);
const deletePrices = db.prepare(`DELETE FROM prices WHERE barcode = ?`);
const insertPrice = db.prepare(
  `INSERT INTO prices (barcode, shop, price, url, scraped_at)
   VALUES (@barcode, @shop, @price, @url, @scrapedAt)`,
);

const seed = db.transaction(() => {
  const scrapedAt = new Date().toISOString();
  for (const product of SAMPLE_PRODUCTS) {
    upsertProduct.run({
      barcode: product.barcode,
      name: product.name,
      category: product.category,
    });
    deletePrices.run(product.barcode);
    for (const price of product.prices) {
      insertPrice.run({
        barcode: product.barcode,
        shop: price.shop,
        price: price.price,
        url: price.url,
        scrapedAt,
      });
    }
  }
});

seed();
console.log(`Seeded ${SAMPLE_PRODUCTS.length} products into data/store.db`);
