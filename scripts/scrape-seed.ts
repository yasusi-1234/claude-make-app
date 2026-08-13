import { getDb } from "../lib/db";
import { extractListing } from "../lib/scrapers/extract";
import { fetchPageText } from "../lib/scrapers/fetch-page";
import { TARGET_BARCODES } from "../lib/scrapers/target-barcodes";
import { SCRAPE_TARGETS } from "../lib/scrapers/targets";

const REQUEST_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (TARGET_BARCODES.length === 0) {
    console.error(
      "lib/scrapers/target-barcodes.ts の TARGET_BARCODES にJANコードを1件以上追加してから実行してください。",
    );
    process.exitCode = 1;
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY が未設定です(価格抽出にClaude APIを使用します)。");
    process.exitCode = 1;
    return;
  }

  const db = getDb();
  const upsertProduct = db.prepare(
    `INSERT INTO products (barcode, name, category) VALUES (@barcode, @name, NULL)
     ON CONFLICT(barcode) DO UPDATE SET name = excluded.name`,
  );
  const deletePrice = db.prepare(`DELETE FROM prices WHERE barcode = ? AND shop = ?`);
  const insertPrice = db.prepare(
    `INSERT INTO prices (barcode, shop, price, url, scraped_at)
     VALUES (@barcode, @shop, @price, @url, @scrapedAt)`,
  );

  for (const barcode of TARGET_BARCODES) {
    console.log(`\n=== ${barcode} ===`);
    let productName: string | null = null;

    for (const target of SCRAPE_TARGETS) {
      const url = target.searchUrl(barcode);
      console.log(`[${target.shopId}] fetching ${url}`);
      try {
        const text = await fetchPageText(url);
        const listing = await extractListing(text, barcode);

        if (listing.found && typeof listing.price === "number") {
          productName = productName ?? listing.name ?? `商品 ${barcode}`;
          deletePrice.run(barcode, target.shopId);
          insertPrice.run({
            barcode,
            shop: target.shopId,
            price: Math.round(listing.price),
            url,
            scrapedAt: new Date().toISOString(),
          });
          console.log(`  -> ${listing.name ?? "(名称不明)"}: ¥${listing.price}`);
        } else {
          console.log("  -> 該当商品が見つかりませんでした");
        }
      } catch (err) {
        console.error(`  -> 取得に失敗しました: ${err instanceof Error ? err.message : err}`);
      }
      await sleep(REQUEST_DELAY_MS);
    }

    if (productName) {
      upsertProduct.run({ barcode, name: productName });
    } else {
      console.log("  (どちらの店でも見つからなかったため products には登録していません)");
    }
  }

  console.log("\n完了");
}

main();
