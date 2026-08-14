/** EAN-13(JANコード)のチェックデジットを検証する */
export function isValidEan13(code: string): boolean {
  if (!/^\d{13}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}
