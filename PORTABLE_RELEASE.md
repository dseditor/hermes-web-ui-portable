# Portable Release & Self-Update Convention

Single source of truth for cutting portable releases of this fork
(`dseditor/hermes-web-ui-portable`). Read this before publishing any release.

## Two artifacts per version

Each version ships **two assets in ONE GitHub Release** (tag `vX.Y.Z`):

| Asset | For | Contains | Consumed by |
|-------|-----|----------|-------------|
| **Full bundle** | First-time users (fresh machine) | Whole portable root: `hermes-web-ui/` (built `dist` + `node_modules` + bundled python core), `node_portable/`, `cloudflared.exe`, `cf-quick.yml`, all `*.bat` | Human download → extract → run `start.bat` |
| **Update payload** | Existing installs (self-update) | Lean: `hermes-web-ui` package only — `dist` + `bin` + `package.json` + apply-update scripts. **Excludes** `node_modules` and bundled python (kept on the install by additive copy) | In-app updater (`handleUpdate` → `apply-update.bat`) |

Both exclude: `llama/` (local models), `chromium/` (hybrid uses system Chrome/Edge),
`data/` (user secrets/sessions), `.git`, caches, `outputs/`.

## Asset NAMING is load-bearing — do not improvise

> The self-updater that runs on an **already-installed** version is baked in at
> build time. Installs from **v0.6.8** carry the *legacy* asset picker, whose
> rule is: pick the first `.zip`/`.tar.gz` whose name matches
> `/portable|hermes-web-ui/i`. If BOTH assets match that regex, it falls back to
> array order — fragile. So the full bundle must NOT match that regex, leaving
> the update payload as the only legacy match.

**Naming rules (apply from v0.6.9 onward):**

- Update payload: **`hermes-web-ui-update-vX.Y.Z.zip`**
  - Must contain `update` (the ≥0.6.9 picker prefers `/update/i`).
  - Also contains `hermes-web-ui` so the legacy picker (v0.6.8 installs) still selects it.
- Full bundle: **`Hermes-Standalone-vX.Y.Z.zip`**
  - **Must NOT contain `portable` or `hermes-web-ui`** — otherwise the legacy
    picker on v0.6.8 installs may grab the 370 MB full bundle and overlay it onto
    the `hermes-web-ui` package dir (wrong root → corrupt install).

Verified by simulation (`pickPortableAsset` old vs new) on 2026-06-03:
with these names, both old and new pickers select the update payload regardless
of upload order.

## Release rules

1. **One Release per version**, both assets attached. Tag `vX.Y.Z`.
2. **Never** publish the full bundle as a separate *non-prerelease* — GitHub marks
   the newest non-prerelease as `Latest`, and `GET /releases/latest` (what the
   updater and `health.ts` query) would then return it, mis-driving self-update.
   A standalone "download only" copy, if ever needed, must be a **prerelease**.
3. `health.ts` gates the update prompt on `cachedLatestVersion !== LOCAL_VERSION`.
   `handleUpdate` itself has **no** version guard, so correctness rides entirely on
   (a) the version-equality gate in `health.ts` and (b) the picker choosing the
   update payload. Keep both intact.

## Build & package steps

1. **Full** `npm run build` (client + server). Never only `build-server.mjs` —
   `__APP_VERSION__` is baked into the client by `vite build`; a stale client
   makes the frontend show a permanent "refresh to vX" banner.
2. Bump `version` in `package.json`; verify it's baked: `dist/server/index.js`
   and `dist/client/assets/*.js` should contain the new version string.
3. **Full bundle**: robocopy the portable root to a clean staging dir, then zip.
   Root-anchored excludes use **absolute paths** (`/XD "<root>\data" "<root>\llama"
   "<root>\chromium" ...`) so nested same-name dirs (`dist/data`,
   `node_modules/**/data`) are preserved; `.git` / `__pycache__` use bare names.
4. **Update payload**: zip just the `hermes-web-ui` package contents
   (`dist`, `bin`, `package.json`, `apply-update.*`).
5. Use **`.zip`** (the updater's `Expand-Archive` only handles `.zip`/`.tar.gz` —
   **`.7z` is not supported**). A fresh Windows machine also extracts `.zip` natively.
6. Before publishing, smoke-test the full bundle from a clean extract: run
   bundled python `--version`, `node_portable` `--version`, confirm baked version,
   ideally boot `start.bat` once.

## History

- `WindowPortable_Preview` (PR0.1): original portable, **no** update mechanism.
- `v0.6.8`: first build with self-update. Carries legacy-named assets
  (`hermes-web-ui-portable-v0.6.8.zip` update + `HermesPortable-v0.6.8.zip` full).
  These predate this convention; harmless because no install fetches v0.6.8 as an
  update (version-equal). The convention above applies from **v0.6.9**.
