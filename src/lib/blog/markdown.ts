/**
 * Minimal markdown → HTML (headings, emphasis, links, lists, paragraphs).
 * Escapes raw HTML in source. Extend here for richer CMS output.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHref(rawHref: string): string {
  const href = rawHref.trim();
  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }
  try {
    const url = new URL(href);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {
    // invalid URL
  }
  return "#";
}

function inlineMarkdown(text: string): string {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = escapeHtml(sanitizeHref(href));
    return `<a href="${safeHref}" class="text-accent-gold hover:text-museum-light underline-offset-2 hover:underline">${label}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return s;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^#+/)?.[0].length ?? 1;
      const tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      const text = line.replace(/^#+\s*/, "");
      parts.push(
        `<${tag} class="font-serif text-xl md:text-2xl text-museum-light mt-8 mb-3">${inlineMarkdown(text)}</${tag}>`,
      );
      i += 1;
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(`<li>${inlineMarkdown(lines[i].replace(/^[-*]\s/, ""))}</li>`);
        i += 1;
      }
      parts.push(
        `<ul class="list-disc pl-5 space-y-2 font-sans text-sm md:text-base text-museum-light/75">${items.join("")}</ul>`,
      );
      continue;
    }

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    const para: string[] = [line];
    i += 1;
    while (i < lines.length && lines[i].trim() !== "" && !/^#{1,3}\s/.test(lines[i]) && !/^[-*]\s/.test(lines[i])) {
      para.push(lines[i]);
      i += 1;
    }
    parts.push(
      `<p class="font-sans text-sm md:text-base leading-relaxed text-museum-light/75">${inlineMarkdown(para.join(" "))}</p>`,
    );
  }

  return parts.join("\n");
}

export function plainToParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
