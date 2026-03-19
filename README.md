# Resume PDF Exporter

Desktop-only Obsidian plugin that exports the active resume note to a one-page PDF using a local Python + ReportLab renderer. The renderer automatically adjusts typography scale so the resume fits on a single page whenever the content can be fit safely.

## Features
- One-click export from the ribbon, status bar, file menu, or command palette
- One-page PDF output with automatic scale adjustment to fit dense resumes
- Ribbon button and command palette export
- Status bar one-click button
- File menu action on markdown files
- Resume-specific markdown parsing and validation
- Same-folder or fixed-folder PDF output
- Optional open-after-export behavior
- External renderer path configuration

## Requirements
- Obsidian Desktop
- Python 3
- `reportlab` installed in the selected Python environment

## Resume Format
- `# NAME`
- first non-empty line after the title is the contact line
- `##` sections
- `###` role headings
- `-` bullets

## How It Fits On One Page
- The renderer uses fixed resume styling and then automatically adjusts font sizes and spacing scale to keep the output on one page.
- If the content can be fit safely, the plugin will shrink the layout until it fits.
- If the content is too long to fit even after scaling, the export fails explicitly instead of generating a broken multi-page layout.

## Usage
- Open a resume note in Obsidian.
- Click the ribbon icon, the status bar button, or run `Resume: Convert current note to PDF`.
- The plugin writes a PDF next to the note by default.
- The PDF is rendered to stay on one page, with the size adjusted automatically when needed.

## Development
```bash
npm install
npm run build
npm test
```

## Public Release Checklist
- Put this folder in a public GitHub repository
- Keep `manifest.json`, `versions.json`, `README.md`, and `LICENSE` at the repo root
- Create a GitHub release tagged exactly as the plugin version, for example `0.1.0`
- Upload `manifest.json`, `main.js`, and `styles.css` to the release assets
- Submit the plugin to the Obsidian community list via `obsidianmd/obsidian-releases`

## Notes
- Version 1 uses the bundled `scripts/render_resume_pdf.py` helper.
- The plugin is intentionally scoped to resume notes, not general markdown export.
