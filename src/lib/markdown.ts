const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

export function slugify(text: string): string {
  let out = "";
  for (const ch of text.toLowerCase()) {
    if (TRANSLIT[ch] !== undefined) out += TRANSLIT[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += "-";
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "") || "section";
}

export type Heading = { id: string; text: string; level: number };

export function extractHeadings(src: string): Heading[] {
  const headings: Heading[] = [];
  let inCode = false;
  src.split("\n").forEach((line) => {
    if (line.trim().startsWith("```")) inCode = !inCode;
    if (inCode) return;
    const m = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (m) {
      const text = m[2].replace(/[*_`]/g, "").trim();
      headings.push({ id: slugify(text), text, level: m[1].length });
    }
  });
  return headings;
}

export type Block =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "hr" };

export function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push({ type: "code", lang, text: buf.join("\n") });
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    const h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (h) {
      const text = h[2].trim();
      blocks.push({ type: "heading", level: h[1].length, text, id: slugify(text.replace(/[*_`]/g, "")) });
      i++;
      continue;
    }

    if (isTableRow(line)) {
      const split = (l: string) =>
        l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const header = split(line);
      i++;
      if (i < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i])) i++;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(split(lines[i]));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", lines: buf });
      continue;
    }

    if (/^[-*+•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t === "") {
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === "") j++;
          if (j < lines.length && /^[-*+•]\s+/.test(lines[j].trim())) {
            i = j;
            continue;
          }
          break;
        }
        if (/^[-*+•]\s+/.test(t)) {
          items.push(t.replace(/^[-*+•]\s+/, ""));
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t === "") {
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === "") j++;
          if (j < lines.length && /^\d+[.)]\s+/.test(lines[j].trim())) {
            i = j;
            continue;
          }
          break;
        }
        if (/^\d+[.)]\s+/.test(t)) {
          items.push(t.replace(/^\d+[.)]\s+/, ""));
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const buf: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith("```") &&
      !/^[-*+•]\s+/.test(lines[i].trim()) &&
      !/^\d+[.)]\s+/.test(lines[i].trim()) &&
      !/^>\s?/.test(lines[i].trim()) &&
      !isTableRow(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "paragraph", text: buf.join(" ") });
  }

  return blocks;
}

const INLINE_RE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g;

export function splitInline(text: string): string[] {
  return text.split(INLINE_RE).filter((p) => p !== "" && p !== undefined);
}

export function inlineKind(part: string):
  | { kind: "code"; value: string }
  | { kind: "strong"; value: string }
  | { kind: "em"; value: string }
  | { kind: "link"; value: string; href: string }
  | { kind: "text"; value: string } {
  if (part.length > 1 && part.startsWith("`") && part.endsWith("`")) {
    return { kind: "code", value: part.slice(1, -1) };
  }
  if (part.length > 3 && part.startsWith("**") && part.endsWith("**")) {
    return { kind: "strong", value: part.slice(2, -2) };
  }
  if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
    return { kind: "em", value: part.slice(1, -1) };
  }
  const m = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
  if (m) return { kind: "link", value: m[1], href: m[2] };
  return { kind: "text", value: part };
}
