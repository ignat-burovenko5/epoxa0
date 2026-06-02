/** Russian mobile/landline display: +7 (XXX) XXX-XX-XX */

const MAX_DIGITS = 11; // 7 + 10 national digits

export function normalizeRuPhoneDigits(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (!digits.length) return "";

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  } else if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  return digits.slice(0, MAX_DIGITS);
}

/** Format digits as +7 (XXX) XXX-XX-XX; empty string if no digits. */
export function formatRuPhone(input: string): string {
  const digits = normalizeRuPhoneDigits(input);
  if (!digits.length) return "";
  if (digits === "7") return "+7 ";

  const rest = digits.slice(1);
  let out = "+7";

  if (!rest.length) return "+7 ";

  out += ` (${rest.slice(0, 3)}`;
  if (rest.length <= 3) return out;

  out += `) ${rest.slice(3, 6)}`;
  if (rest.length <= 6) return out;

  out += `-${rest.slice(6, 8)}`;
  if (rest.length <= 8) return out;

  out += `-${rest.slice(8, 10)}`;
  return out;
}

export function isValidRuPhone(input: string): boolean {
  return normalizeRuPhoneDigits(input).length === MAX_DIGITS;
}

/** Caret index after the Nth digit (0-based) in a formatted string. */
export function caretAfterDigitIndex(formatted: string, digitIndex: number): number {
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!)) {
      if (count === digitIndex) return i + 1;
      count += 1;
    }
  }
  return formatted.length;
}

export function countDigitsBefore(str: string, caret: number): number {
  return str.slice(0, caret).replace(/\D/g, "").length;
}
