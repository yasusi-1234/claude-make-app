import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ローカルファイルDB(data/store.db)をAPI Routeのサーバーレス関数バンドルに含める。
  // Turso(TURSO_DATABASE_URL)を使う場合はこのファイル自体が存在しないため影響なし。
  outputFileTracingIncludes: {
    "/api/lookup": ["./data/store.db"],
  },
};

export default nextConfig;
