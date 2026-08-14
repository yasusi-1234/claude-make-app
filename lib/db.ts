import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";

const LOCAL_DB_PATH = path.join(process.cwd(), "data", "store.db");

let clientPromise: Promise<Client> | null = null;

function resolveUrl(): string {
  return process.env.TURSO_DATABASE_URL ?? `file:${LOCAL_DB_PATH}`;
}

async function initClient(): Promise<Client> {
  const url = resolveUrl();
  if (url.startsWith("file:")) {
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await client.migrate([
    `CREATE TABLE IF NOT EXISTS products (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL REFERENCES products(barcode),
      shop TEXT NOT NULL,
      price INTEGER NOT NULL,
      url TEXT,
      scraped_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_prices_barcode ON prices(barcode)`,
  ]);

  return client;
}

/**
 * TURSO_DATABASE_URL が未設定ならローカルの data/store.db を使う。
 * 設定されていればそのままTursoへリモート接続する(コード変更不要)。
 */
export function getDb(): Promise<Client> {
  if (!clientPromise) clientPromise = initClient();
  return clientPromise;
}
