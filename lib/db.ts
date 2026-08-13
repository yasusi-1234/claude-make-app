import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "data", "store.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT
    );
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL REFERENCES products(barcode),
      shop TEXT NOT NULL,
      price INTEGER NOT NULL,
      url TEXT,
      scraped_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_prices_barcode ON prices(barcode);
  `);
  return db;
}
