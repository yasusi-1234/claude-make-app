import { describe, expect, it } from "vitest";
import { isValidEan13 } from "./ean13";
import { SAMPLE_PRODUCTS } from "./sample-products";

describe("isValidEan13", () => {
  it("正しいチェックデジットのコードを受理する", () => {
    expect(isValidEan13("4900000000016")).toBe(true);
  });

  it("チェックデジットが不一致のコードを拒否する", () => {
    expect(isValidEan13("4900000000017")).toBe(false);
  });

  it("13桁でない入力を拒否する", () => {
    expect(isValidEan13("123")).toBe(false);
    expect(isValidEan13("49000000000160")).toBe(false);
  });

  it("数字以外を含む入力を拒否する", () => {
    expect(isValidEan13("490000000001a")).toBe(false);
  });

  it("サンプル商品のバーコードはすべて有効なEAN-13である", () => {
    for (const product of SAMPLE_PRODUCTS) {
      expect(isValidEan13(product.barcode)).toBe(true);
    }
  });
});
