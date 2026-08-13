import type { ShopId } from "./shops";

export interface PriceQuote {
  shop: ShopId;
  price: number;
  url: string | null;
  scrapedAt: string;
}

export interface ProductLookupResult {
  barcode: string;
  name: string;
  category: string | null;
  prices: PriceQuote[];
}
