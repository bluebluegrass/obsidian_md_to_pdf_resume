# Community Submission Checklist

This checklist is based on the current official Obsidian developer documentation for submitting a community plugin:
- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
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
1. Update `manifest.json` and `versions.json` using semantic versioning.
2. Run `npm install`, `npm run build`, `npm test`, and `npm run check-release`.
3. Commit the release, push it, and create a Git tag that exactly matches the manifest version. For example, if the manifest says `0.2.0`, create the tag `0.2.0`.
4. Push the tag. The release workflow creates a GitHub release with these assets:
   - `resume-pdf-exporter.zip` for manual installation
   - `main.js`
   - `manifest.json`
   - `styles.css`

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
- The plugin is self-contained. Users do not need Python or any other local dependency.
- The one-page fit behavior should stay documented because it is a key differentiator of the plugin.
