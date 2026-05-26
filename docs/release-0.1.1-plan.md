# Suggested `0.1.1` Follow-Up Plan

This is the recommended next release before community submission if you want a slightly stronger public version.

## Goals

- Polish the built-in renderer experience
- Improve plugin discoverability in the UI
- Make installation and troubleshooting clearer

## Recommended Changes

### 1. Add a built-in export preview command
- Add a simple preview or sample-export command for faster validation
- This improves confidence before sharing the generated PDF.

### 2. Add a settings button to validate export behavior
- Add a `Test export` action in settings
- It should verify:
  - the current note matches the expected resume structure
  - the output location is writable
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
- Use a clean one-page resume note with the documented heading structure
```
