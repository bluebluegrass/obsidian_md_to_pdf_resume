# Obsidian Community Submission Draft

Use this when opening a pull request against:
- [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)

## `community-plugins.json` Entry

```json
{
  "id": "resume-pdf-exporter",
  "name": "Resume PDF Exporter",
  "author": "Simeng Dai",
  "description": "Obsidian plugin that exports structured resume notes to one-page PDF with one click.",
  "repo": "bluebluegrass/obsidian_md_to_pdf_resume"
}
```

## Suggested PR Title

```text
Add plugin: Resume PDF Exporter
```

## Suggested PR Body

```markdown
## Checklist

- [x] My plugin name and id are unique.
- [x] I have tested the plugin on the latest Obsidian desktop version.
- [x] I have included a valid open source license in the repository.
- [x] The repository is public and contains the source code.
- [x] `manifest.json` and `versions.json` are present at the repository root.
- [x] A GitHub release exists with release assets for the submitted version.
- [x] The release assets include `main.js`, `manifest.json`, and `styles.css`.
- [x] The plugin has a README with installation and usage instructions.

## Plugin Summary

Resume PDF Exporter adds a one-click workflow for exporting structured resume notes in Obsidian to a one-page PDF.

It is designed for users who maintain resumes as markdown notes and need more control than generic markdown-to-PDF output. The plugin uses a resume-specific renderer and automatically adjusts scale so the final export stays on one page whenever the content can be fit safely.

## Notes

- Desktop only
- Requires a local Python interpreter with `reportlab` installed
- Supports export from the command palette, file menu, and status bar
```

## Final Pre-PR Checks

- Confirm the latest GitHub release version matches `manifest.json`
- Confirm release assets download correctly
- Confirm screenshots are present in the README
- Confirm the plugin installs cleanly in a fresh vault
