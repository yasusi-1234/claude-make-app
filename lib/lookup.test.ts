import { beforeAll, describe, expect, it } from "vitest";
import { getDb } from "./db";
import { lookupProduct } from "./lookup";

const TEST_BARCODE = "1234567890128";

beforeAll(async () => {
  process.env.TURSO_DATABASE_URL = ":memory:";

  const db = await getDb();
  const scrapedAt = new Date().toISOString();
  await db.execute({
    sql: "INSERT INTO products (barcode, name, category) VALUES (?, ?, ?)",
    args: [TEST_BARCODE, "テスト商品", "テストカテゴリ"],
  });
  await db.execute({
    sql: "INSERT INTO prices (barcode, shop, price, url, scraped_at) VALUES (?, ?, ?, ?, ?)",
    args: [TEST_BARCODE, "bookoff", 100, "https://example.com/bookoff", scrapedAt],
  });
  await db.execute({
    sql: "INSERT INTO prices (barcode, shop, price, url, scraped_at) VALUES (?, ?, ?, ?, ?)",
    args: [TEST_BARCODE, "suruga-ya", 150, "https://example.com/suruga-ya", scrapedAt],
  });
});

describe("lookupProduct", () => {
  it("登録済みバーコードは商品情報と価格を高い順で返す", async () => {
    const result = await lookupProduct(TEST_BARCODE);
    expect(result).not.toBeNull();
    expect(result?.name).toBe("テスト商品");
    expect(result?.category).toBe("テストカテゴリ");
    expect(result?.prices.map((p) => p.shop)).toEqual(["suruga-ya", "bookoff"]);
    expect(result?.prices.map((p) => p.price)).toEqual([150, 100]);
  });

  it("未登録のバーコードはnullを返す", async () => {
    const result = await lookupProduct("0000000000000");
    expect(result).toBeNull();
  });
});
