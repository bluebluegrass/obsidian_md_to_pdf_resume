# Obsidian Community Submission Draft

Use this when opening a pull request against:
- [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)

## `community-plugins.json` Entry

```json
{
  "id": "resume-pdf-exporter",
  "name": "Resume PDF Exporter",
  "author": "Simeng Dai",
  "description": "Exports structured resume notes to one-page PDF with one click.",
  "repo": "bluebluegrass/obsidian_md_to_pdf_resume"
}
```

## Suggested PR Title

```text
Add plugin: Resume PDF Exporter
```

## Suggested PR Body

```markdown
# I am submitting a new Community Plugin

- [x] I attest that I have done my best to deliver a high-quality plugin, am proud of the code I have written, and would recommend it to others. I commit to maintaining the plugin and being responsive to bug reports. If I am no longer able to maintain it, I will make reasonable efforts to find a successor maintainer or withdraw the plugin from the directory.

## Repo URL

Link to my plugin:
https://github.com/bluebluegrass/obsidian_md_to_pdf_resume

## Release Checklist
- [x] I have tested the plugin on
  - [ ] Windows
  - [x] macOS
  - [ ] Linux
  - [ ] Android _(if applicable)_
  - [ ] iOS _(if applicable)_
- [x] My GitHub release contains all required files (as individual files, not just in the source.zip / source.tar.gz)
  - [x] `main.js`
  - [x] `manifest.json`
  - [x] `styles.css` _(optional)_
- [x] GitHub release name matches the exact version number specified in my manifest.json (_**Note:** Use the exact version number, don't include a prefix `v`_)
- [x] The `id` in my `manifest.json` matches the `id` in the `community-plugins.json` file.
- [x] My README.md describes the plugin's purpose and provides clear usage instructions.
- [x] I have read the developer policies at https://docs.obsidian.md/Developer+policies, and have assessed my plugin's adherence to these policies.
- [x] I have read the tips in https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines and have self-reviewed my plugin to avoid these common pitfalls.
- [x] I have added a license in the LICENSE file.
- [x] My project respects and is compatible with the original license of any code from other plugins that I'm using.
      I have given proper attribution to these other projects in my `README.md`.

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
