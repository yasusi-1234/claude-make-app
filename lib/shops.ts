export type ShopId = "bookoff" | "suruga-ya";

export interface Shop {
  id: ShopId;
  name: string;
}

export const SHOPS: Record<ShopId, Shop> = {
  bookoff: { id: "bookoff", name: "ブックオフ" },
  "suruga-ya": { id: "suruga-ya", name: "駿河屋" },
};
