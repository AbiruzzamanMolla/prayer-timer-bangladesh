# Release & Publishing Workflow

Follow these instructions carefully to publish a new version of the **Muslim Prayer Timer** VS Code Extension.

---

### Step 1: Update the Version Number

Before bundling a new release, open `package.json` and bump the `"version"` field (e.g. `"2.0.0"` -> `"2.0.1"` or `"2.1.0"`).

### Step 2: Document the Changes

1. Open `CHANGELOG.md`.
2. Create a new heading using the identical version number you just set (e.g. `## [2.0.1] - 2026-02-28`).
3. Add bullet points for what changed under `### Added`, `### Fixed`, or `### Changed`.
4. Check `README.md` to see if you need to add any new features to the feature list.

### Step 3: Build the Production Code

Run the Vite build command to bundle the React UI, and esbuild to bundle the `extension.js` native host:

```bash
npm run build
```

_(This command automatically runs `vite build && npm run build:ext` under the hood)._

### Step 4: Package the VSIX

To package the final `.vsix` binaries for distribution, use `vsce`. We use specific flags because we bundle `adhan-js` natively into a single `/out` file:

```bash
npx --yes @vscode/vsce package --no-dependencies --allow-missing-repository --allow-star-activation
```

### Step 5: Test Locally

If you want to test the built VSIX before publishing:

1. Open VS Code.
2. Go to the Extensions panel.
3. Click the explicit `...` top right and select **Install from VSIX**.
4. Select the output file (e.g., `prayer-timer-bangladesh-2.0.1.vsix`).

### Step 6: Git Tag the Release

Make sure the branch is fully committed. Create a release tag tying exactly to your `package.json` version:

```bash
git add .
git commit -m "Bump version to 2.0.1"
git push
git tag 2.0.1
git push --tags --force
```
