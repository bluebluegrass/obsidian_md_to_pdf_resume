import { normalizeResumeMarkdown } from "./normalizeMarkdown";
import type { ResumeDocument, ResumeItem } from "./resumeTypes";

export function parseResumeMarkdown(markdown: string): ResumeDocument {
  const lines = normalizeResumeMarkdown(markdown);

  let name = "";
  let contact = "";
  let awaitingContact = false;
  const items: ResumeItem[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    if (line.startsWith("# ")) {
      name = line.slice(2).trim();
      awaitingContact = true;
      continue;
    }

    if (awaitingContact) {
      if (line.startsWith("## ") || line.startsWith("### ") || line.startsWith("- ")) {
        throw new Error("Resume is missing a contact line after the name heading.");
      }
      contact = line;
      awaitingContact = false;
      continue;
    }

    if (line.startsWith("## ")) {
      items.push({ kind: "section", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      items.push({ kind: "role", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      items.push({ kind: "bullet", text: line.slice(2).trim() });
      continue;
    }

    items.push({ kind: "text", text: line });
  }

  if (!name) {
    throw new Error("Resume is missing a top-level '# Name' heading.");
  }
  if (!contact) {
    throw new Error("Resume is missing a contact line after the name heading.");
  }
  if (items.length === 0) {
    throw new Error("Resume is missing body content.");
  }

  return { name, contact, items };
}
