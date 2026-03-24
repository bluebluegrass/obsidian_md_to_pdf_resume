# Resume PDF Exporter

Resume PDF Exporter is a desktop-only Obsidian plugin for people who keep job-application resumes as markdown notes and want a reliable, one-click PDF export workflow inside their vault.

Instead of relying on generic markdown-to-PDF output, the plugin uses a resume-specific renderer with controlled typography, spacing, and section hierarchy. The renderer automatically adjusts scale so the resume stays on a single page whenever it can fit safely.

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

## Why This Plugin Exists
- Resume notes often need more control than general markdown export.
- A resume should stay compact, readable, and ATS-friendly.
- This plugin keeps the export flow inside Obsidian so you can edit and generate the final PDF without switching tools.

## Screenshots
Add screenshots under `docs/images/` and update this section with real image embeds before community submission.

Recommended screenshots:
- `docs/images/status-bar-button.png`
  - Show the visible one-click export button in the status bar.
- `docs/images/exported-pdf.png`
  - Show the generated one-page PDF next to the markdown note.
- `docs/images/plugin-settings.png`
  - Show Python path, output mode, and renderer settings.

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

## Installation

### Manual installation
1. Download the latest release assets:
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Create a folder named `resume-pdf-exporter` in your vault under `.obsidian/plugins/`.
3. Copy the release assets into that folder.
4. Copy `scripts/render_resume_pdf.py` into `.obsidian/plugins/resume-pdf-exporter/scripts/`.
5. Enable the plugin under `Settings -> Community plugins`.

### Python requirement
- Configure the plugin to use a Python interpreter that already has `reportlab` installed.
- On this project’s reference setup, `/opt/homebrew/bin/python3` is used.

## Development
```bash
npm install
npm run build
npm test
```

## Community Submission
See [docs/community-submission.md](docs/community-submission.md) for the exact release and review checklist used for the Obsidian community plugin directory.

Additional publishing docs:
- [Community PR draft](docs/obsidian-releases-submission-draft.md)
- [Suggested `0.1.1` plan](docs/release-0.1.1-plan.md)
- [Screenshot plan](docs/screenshots-plan.md)

## Notes
- Version 1 uses the bundled `scripts/render_resume_pdf.py` helper.
- The plugin is intentionally scoped to resume notes, not general markdown export.
