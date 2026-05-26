import type { ResumeDocument, ResumeItem } from "../domain/resumeTypes";

export const PAGE_WIDTH = 595.2756;
export const PAGE_HEIGHT = 841.8898;
const LEFT = 42;
const RIGHT = 42;
const TOP = 34;
const BOTTOM = 30;
const BULLET_INDENT = 11;
const SECTION_BREAK_LINES = 1.0;

const BASE_SIZE = {
  name: 17.2,
  contact: 10.4,
  section: 10.8,
  role: 10.0,
  text: 9.0,
  bullet: 9.0
} as const;

const BASE_LEAD = {
  name: 19.2,
  contact: 12.0,
  section: 12.0,
  role: 11.4,
  text: 10.3,
  bullet: 10.3
} as const;

const SPACE = {
  header: 9.5,
  section: 2.6,
  role: 2.2,
  text: 1.3,
  bullet: 1.0
} as const;

export type RenderKind = keyof typeof BASE_SIZE;

export interface RenderLine {
  text: string;
  x: number;
  y: number;
  font: "Times-Roman" | "Times-Bold";
  size: number;
}

const FONT_BY_KIND: Record<RenderKind, "Times-Roman" | "Times-Bold"> = {
  name: "Times-Bold",
  contact: "Times-Roman",
  section: "Times-Bold",
  role: "Times-Bold",
  text: "Times-Roman",
  bullet: "Times-Roman"
};

interface LayoutEntry {
  kind: RenderKind;
  lines: string[];
  size: number;
  lead: number;
  extraBefore: number;
}

function measureText(text: string, size: number): number {
  let units = 0;
  for (const char of text) {
    if (char === " ") {
      units += 0.25;
    } else if ("ilI.,:;!'|".includes(char)) {
      units += 0.28;
    } else if ("frtJ()[]{}-".includes(char)) {
      units += 0.35;
    } else if ("mwMW@%&QG".includes(char)) {
      units += 0.92;
    } else if ("ABCDEFGHKNOPRSTUVXYZ23456789".includes(char)) {
      units += 0.62;
    } else if ("abcdeghknopqsuvxyz013".includes(char)) {
      units += 0.5;
    } else {
      units += 0.45;
    }
  }
  return units * size;
}

function wrapText(text: string, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [""];
  }

  const wrapped: string[] = [];
  let current = words[0];

  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (measureText(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    wrapped.push(current);
    current = word;
  }

  wrapped.push(current);
  return wrapped;
}

function buildLayout(document: ResumeDocument, scale: number): LayoutEntry[] {
  const usableWidth = PAGE_WIDTH - LEFT - RIGHT;
  const sizes = Object.fromEntries(
    Object.entries(BASE_SIZE).map(([key, value]) => [key, value * scale])
  ) as Record<RenderKind, number>;
  const leads = Object.fromEntries(
    Object.entries(BASE_LEAD).map(([key, value]) => [key, value * scale])
  ) as Record<RenderKind, number>;
  const sectionBreakGap = leads.text * SECTION_BREAK_LINES;

  const entries: LayoutEntry[] = [
    { kind: "name", lines: [document.name], size: sizes.name, lead: leads.name, extraBefore: 0 },
    { kind: "contact", lines: [document.contact], size: sizes.contact, lead: leads.contact, extraBefore: 0 }
  ];

  document.items.forEach((item, index) => {
    const maxWidth = item.kind === "bullet" ? usableWidth - BULLET_INDENT : usableWidth;
    entries.push({
      kind: item.kind,
      lines: wrapText(item.text, sizes[item.kind], maxWidth),
      size: sizes[item.kind],
      lead: leads[item.kind],
      extraBefore: item.kind === "section" && index > 0 ? sectionBreakGap : 0
    });
  });

  return entries;
}

function measureHeight(entries: LayoutEntry[], scale: number): number {
  let y = PAGE_HEIGHT - TOP;
  y -= entries[0].lead * entries[0].lines.length;
  y -= SPACE.header * scale;
  y -= entries[1].lead * entries[1].lines.length;
  y -= SPACE.header * scale;

  for (const entry of entries.slice(2)) {
    y -= entry.extraBefore;
    y -= entry.lead * entry.lines.length;
    y -= SPACE[entry.kind] * scale;
  }

  return (PAGE_HEIGHT - TOP) - y;
}

function chooseScale(document: ResumeDocument): number {
  const availableHeight = PAGE_HEIGHT - TOP - BOTTOM;

  const used = (scale: number): number => measureHeight(buildLayout(document, scale), scale);

  let lo = 0.7;
  let hi = 1.5;
  let best = lo;

  for (let i = 0; i < 28; i += 1) {
    const mid = (lo + hi) / 2;
    if (used(mid) <= availableHeight) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const ratio = used(best) / availableHeight;
  if (ratio < 0.94) {
    let lo2 = best;
    let hi2 = Math.min(best * 1.08, 1.5);
    let candidate = best;
    for (let i = 0; i < 20; i += 1) {
      const mid = (lo2 + hi2) / 2;
      const currentUsed = used(mid);
      const currentRatio = currentUsed / availableHeight;
      if (currentUsed <= availableHeight && currentRatio <= 0.97) {
        candidate = mid;
        lo2 = mid;
      } else {
        hi2 = mid;
      }
    }
    best = candidate;
  }

  if (used(best) > availableHeight) {
    throw new Error("Resume content does not fit on one page.");
  }

  return best;
}

function itemText(entry: LayoutEntry, pageY: number, lineIndex: number): RenderLine {
  const baseline = pageY - entry.lead + 2;
  const line = entry.lines[lineIndex];
  if (entry.kind === "name" || entry.kind === "contact") {
    return {
      text: line,
      x: (PAGE_WIDTH - measureText(line, entry.size)) / 2,
      y: baseline,
      font: FONT_BY_KIND[entry.kind],
      size: entry.size
    };
  }

  if (entry.kind === "bullet") {
    return {
      text: lineIndex === 0 ? `• ${line}` : `  ${line}`,
      x: LEFT,
      y: baseline,
      font: FONT_BY_KIND[entry.kind],
      size: entry.size
    };
  }

  return {
    text: line,
    x: LEFT,
    y: baseline,
    font: FONT_BY_KIND[entry.kind],
    size: entry.size
  };
}

export function createRenderLines(document: ResumeDocument): RenderLine[] {
  const scale = chooseScale(document);
  const entries = buildLayout(document, scale);
  const lines: RenderLine[] = [];
  let y = PAGE_HEIGHT - TOP;

  entries.forEach((entry, index) => {
    if (index >= 2) {
      y -= entry.extraBefore;
    }
    entry.lines.forEach((_, lineIndex) => {
      lines.push(itemText(entry, y, lineIndex));
      y -= entry.lead;
    });
    y -= (index < 2 ? SPACE.header : SPACE[entry.kind]) * scale;
  });

  if (y < BOTTOM) {
    throw new Error("Resume content overflowed the page during render.");
  }

  return lines;
}
