export type ResumeItem =
  | { kind: "section"; text: string }
  | { kind: "role"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "text"; text: string };

export interface ResumeDocument {
  name: string;
  contact: string;
  items: ResumeItem[];
}
