# Community Submission Checklist

This checklist is based on the current official Obsidian developer documentation for submitting a community plugin:
- [Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin)
- [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)

## Before Submission
- Keep these files at the repository root:
  - `README.md`
  - `LICENSE`
  - `manifest.json`
  - `versions.json`
- Make sure `manifest.json` uses the same version you want to release.
- Make sure the repository is public and contains the source code.

## Release Checklist
1. Update `manifest.json` version using semantic versioning.
2. Build the plugin.
3. Create a GitHub release with a tag that exactly matches the manifest version.
4. Upload these release assets:
   - `main.js`
   - `manifest.json`
   - `styles.css` (optional, but included for this plugin)

## Community Plugin Submission
1. Open `community-plugins.json` in `obsidianmd/obsidian-releases`.
2. Add a new entry at the end of the array:

```json
{
  "id": "resume-pdf-exporter",
  "name": "Resume PDF Exporter",
  "author": "Simeng Dai",
  "description": "Obsidian plugin that exports structured resume notes to one-page PDF with one click.",
  "repo": "bluebluegrass/obsidian_md_to_pdf_resume"
}
```

3. Create a pull request with the title:
   - `Add plugin: Resume PDF Exporter`
4. Switch the PR form to the Community Plugin template.
5. Fill in the checklist in the PR body and mark completed items with `[x]`.
6. Wait for validation and review from the Obsidian team.

## Recommended Final Polish Before Submission
- Add screenshots under `docs/images/`
- Add a short animated GIF or screenshot sequence to the README
- Verify the release assets match the latest source
- Test installation from the GitHub release in a clean vault

## Notes Specific To This Plugin
- The plugin depends on a local Python interpreter with `reportlab` installed.
- The README should call out that requirement clearly so users understand setup.
- The one-page fit behavior should stay documented because it is a key differentiator of the plugin.
