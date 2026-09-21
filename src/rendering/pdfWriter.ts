import fs from "node:fs/promises";
import type { RenderLine } from "./layout";

function pdfNumber(value: number): string {
  return value.toFixed(3).replace(/\.?0+$/, "");
}

function escapePdfText(value: string): string {
  return toWinAnsi(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function toWinAnsi(value: string): string {
  const replacements: Record<string, string> = {
    "•": "\x95",
    "–": "\x96",
    "—": "\x97",
    "‘": "\x91",
    "’": "\x92",
    "“": "\x93",
    "”": "\x94",
    "…": "\x85",
    " ": " "
  };

  return Array.from(value).map((character) => {
    if (character in replacements) {
      return replacements[character];
    }
    const code = character.codePointAt(0) ?? 0;
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) {
      return character;
    }
    throw new Error(`Unsupported character in resume: ${character}`);
  }).join("");
}

function buildContentStream(lines: RenderLine[]): string {
  return lines.map((line) => {
    const fontId = line.font === "Times-Bold" ? "F2" : "F1";
    return [
      "BT",
      `/${fontId} ${pdfNumber(line.size)} Tf`,
      `1 0 0 1 ${pdfNumber(line.x)} ${pdfNumber(line.y)} Tm`,
      `(${escapePdfText(line.text)}) Tj`,
      "ET"
    ].join("\n");
  }).join("\n");
}

export async function writePdf(params: {
  outputPath: string;
  pageWidth: number;
  pageHeight: number;
  lines: RenderLine[];
}): Promise<void> {
  const { outputPath, pageWidth, pageHeight, lines } = params;
  const stream = buildContentStream(lines);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfNumber(pageWidth)} ${pdfNumber(pageHeight)}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>"
  ];

  const parts = ["%PDF-1.4\n"];
  const offsets = [0];
  let cursor = Buffer.byteLength(parts[0], "latin1");

  objects.forEach((object, index) => {
    offsets.push(cursor);
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`;
    parts.push(chunk);
    cursor += Buffer.byteLength(chunk, "latin1");
  });

  const xrefOffset = cursor;
  const xref = [
    `xref\n0 ${objects.length + 1}`,
    "0000000000 65535 f"
  ];
  offsets.slice(1).forEach((offset) => {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n`);
  });

  const trailer = [
    xref.join("\n"),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    `startxref\n${xrefOffset}`,
    "%%EOF\n"
  ].join("\n");

  parts.push(trailer);
  await fs.writeFile(outputPath, Buffer.from(parts.join(""), "latin1"));
}
