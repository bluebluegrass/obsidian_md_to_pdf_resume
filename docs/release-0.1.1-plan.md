# Suggested `0.1.1` Follow-Up Plan

This is the recommended next release before community submission if you want a slightly stronger public version.

## Goals

- Reduce setup friction for first-time users
- Improve plugin discoverability in the UI
- Make installation and troubleshooting clearer

## Recommended Changes

### 1. Add a built-in settings hint for Python setup
- Detect when `reportlab` is missing and show a targeted error message:
  - explain that the configured Python interpreter does not have `reportlab`
  - suggest the exact settings field to update
- This improves the first-run experience significantly.

### 2. Add a settings button to validate renderer configuration
- Add a `Test renderer` action in settings
- It should verify:
  - Python executable exists
  - renderer script exists
  - `reportlab` is importable
- This avoids trial-and-error through failed export attempts.

### 3. Add a clearer empty-state/help message in README
- Include one example resume markdown note
- Include one screenshot of the settings panel
- Include one screenshot of a successful export flow

### 4. Improve file-menu workflow
- If possible, export the clicked markdown file directly without relying on opening it first
- Current behavior is acceptable, but direct export from the context menu is cleaner.

### 5. Improve release polish
- Update screenshots
- Confirm release notes
- Confirm install steps in a clean vault

## Suggested Version Bump

- `0.1.1`

## Suggested Release Note

```markdown
### Improvements
- Added clearer public documentation and submission guidance
- Improved one-click export visibility with status bar and file menu access
- Improved renderer fitting reliability for dense one-page resumes

### Recommended setup
- Configure the plugin to use a Python interpreter with `reportlab` installed
```
