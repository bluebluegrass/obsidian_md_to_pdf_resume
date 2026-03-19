# Resume PDF Exporter

Desktop-only Obsidian plugin that exports the active resume note to a one-page PDF using a local Python + ReportLab renderer.

## Features
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
