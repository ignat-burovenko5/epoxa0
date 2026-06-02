/** Stable id for in-page anchors (e.g. /dostavka-i-oplata#2-rezervirovanie-po-telefonu). */
export function headingAnchorId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

/** Split scraped " - item - item" paragraphs into list items. */
export function splitBulletItems(paragraph: string): string[] {
  const text = paragraph.trim();
  if (!text.includes(" - ")) {
    const single = text.replace(/^-\s*/, "").trim();
    return single ? [single] : [];
  }

  return text
    .split(/\s+-\s+/)
    .map((part) => part.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

export const INFO_PHONE_PATTERN =
  /(\+?7[\s(]?\d{3}[)\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}|8\s*\(?\d{3}\)?\s*\d{3}[-\s]?\d{2}[-\s]?\d{2})/g;
