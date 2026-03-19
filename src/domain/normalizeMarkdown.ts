export function stripInlineBold(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1");
}

export function normalizeResumeMarkdown(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*-\s*###\s+/, "### "))
    .map(stripInlineBold)
    .map((line) => line.replace(/[ \t]+$/g, ""));
}
