/**
 * Assign random publication dates (DD/MM/YYYY) from 01/01/2026 through today
 * to all entries in epoxa-sections.json and matching section preview lines.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "src/data/epoxa-sections.json");

const RANGE_START = new Date(2026, 0, 1);
const RANGE_END = new Date();

function randomDateString() {
  const startMs = RANGE_START.getTime();
  const endMs = RANGE_END.getTime();
  const t = startMs + Math.random() * (endMs - startMs);
  const d = new Date(t);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

const LEADING_DATE = /^[\d]{1,2}[./][\d]{1,2}[./][\d]{4}\s*—\s*/;

function datePrefixes(date) {
  const normalized = date.replace(/\//g, ".");
  return [date, normalized];
}

function replaceParagraphDate(paragraph, oldDate, newDate) {
  for (const prefix of datePrefixes(oldDate)) {
    if (paragraph.startsWith(`${prefix} —`) || paragraph.startsWith(`${prefix}—`)) {
      return paragraph.replace(LEADING_DATE, `${newDate} — `);
    }
  }
  return paragraph;
}

function walkEntries(sections) {
  let count = 0;
  for (const section of Object.values(sections)) {
    if (!section?.entries?.length) continue;

    for (const entry of section.entries) {
      if (!entry.date) continue;
      const oldDate = entry.date;
      const newDate = randomDateString();
      entry.date = newDate;
      count++;

      if (section.paragraphs) {
        section.paragraphs = section.paragraphs.map((p) =>
          typeof p === "string" ? replaceParagraphDate(p, oldDate, newDate) : p,
        );
      }
    }
  }
  return count;
}

const data = JSON.parse(readFileSync(dataPath, "utf8"));
const updated = walkEntries(data.sections);
writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Updated ${updated} entry dates (${RANGE_START.toISOString().slice(0, 10)} … ${RANGE_END.toISOString().slice(0, 10)}).`);
