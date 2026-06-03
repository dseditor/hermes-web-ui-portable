# Portable Release & Self-Update Convention

Single source of truth for cutting portable releases of this fork
(`dseditor/hermes-web-ui-portable`). Read this before publishing any release.

## Two artifacts per version

Each version ships **two assets in ONE GitHub Release** (tag `vX.Y.Z`):

| Asset | Format | For | Contains | Consumed by |
|-------|--------|-----|----------|-------------|
| **Full bundle** | **`.7z`** | First-time users (fresh machine) | Whole portable root: `hermes-web-ui/` (built `dist` + `node_modules` + bundled python core), `node_portable/`, `cloudflared.exe`, `cf-quick.yml`, all `*.bat` | Human download → extract → run `start.bat` |
| **Update payload** | **`.zip`** | Existing installs (self-update) | Lean: `hermes-web-ui` package only — `dist` + `bin` + `package.json` + apply-update scripts. **Excludes** `node_modules` and bundled python (kept on the install by additive copy) | In-app updater (`handleUpdate` → `apply-update.bat`) |

> **Why `.7z` for the full bundle is the recommended design:** the updater's
> `pickPortableAsset` filters to `.zip`/`.tar.gz` *before* any name matching, so a
> `.7z` asset is **invisible to the picker** — it can never be mis-selected for
> self-update, regardless of its name. That removes the legacy-picker naming
> constraint entirely (the full bundle can keep the name `HermesPortable-*`), and
> `.7z` (LZMA2 + solid) is ~37% smaller than `.zip` (DEFLATE, 32KB window,
> per-file) on the many-small-files `node_modules` tree (e.g. 234 MB vs 371 MB).
> Windows 11 (24H2+) extracts `.7z` natively; older machines need 7-Zip.

Both exclude: `llama/` (local models), `chromium/` (hybrid uses system Chrome/Edge),
`data/` (user secrets/sessions), `.git`, caches, `outputs/`.

## Asset naming & format

**Naming (apply from v0.6.9 onward):**

- Update payload: **`hermes-web-ui-update-vX.Y.Z.zip`**
  - Contains `update` (the ≥0.6.9 picker prefers `/update/i`).
  - Also contains `hermes-web-ui` so the legacy picker (v0.6.8 installs) still selects it.
- Full bundle: **`HermesPortable-vX.Y.Z.7z`**
  - Free naming — because it is `.7z`, the picker filters it out before name
    matching (see the table note above), so it can never be mis-selected.

**Why this is robust:** the updater that runs on an *already-installed* version
is baked in at build time. v0.6.8 installs carry the *legacy* picker (first
`.zip`/`.tar.gz` matching `/portable|hermes-web-ui/i`). Shipping the full bundle
as `.7z` keeps it out of the candidate set entirely, so the update payload is the
only archive the picker can see. Verified by simulation (`pickPortableAsset` old
vs new, 2026-06-03).

> **Fallback only — if you ever ship the full bundle as `.zip`/`.tar.gz`** (e.g.
> for a machine with no `.7z` support): it then becomes visible to the picker and
> **must NOT contain `portable` or `hermes-web-ui`** in its name (use e.g.
> `Hermes-Standalone-vX.Y.Z.zip`), or the legacy picker on v0.6.8 installs may
> grab the full bundle and overlay it onto the `hermes-web-ui` dir (wrong root →
> corrupt install). Prefer `.7z` to avoid this trap altogether.

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
3. **Full bundle** → **`.7z`**: robocopy the portable root to a clean staging dir,
   then `7z a -t7z -mx5`. Root-anchored excludes use **absolute paths**
   (`/XD "<root>\data" "<root>\llama" "<root>\chromium" ...`) so nested same-name
   dirs (`dist/data`, `node_modules/**/data`) are preserved; `.git` / `__pycache__`
   use bare names.
4. **Update payload** → **`.zip`**: zip just the `hermes-web-ui` package contents
   (`dist`, `bin`, `package.json`, `apply-update.*`). The updater's `Expand-Archive`
   only handles `.zip`/`.tar.gz` — **`.7z` is not supported here**, so the *update
   payload* must be `.zip`/`.tar.gz`. (The full bundle is `.7z` precisely because
   the updater should NOT touch it.)
5. Before publishing, smoke-test the full bundle from a clean extract: run
   bundled python `--version`, `node_portable` `--version`, confirm baked version,
   ideally boot `start.bat` once.

## History

- `WindowPortable_Preview` (PR0.1): original portable, **no** update mechanism.
- `v0.6.8`: first build with self-update. Update payload
  `hermes-web-ui-portable-v0.6.8.zip` (legacy name, but the only `.zip` so the
  picker is unambiguous) + full bundle `HermesPortable_v0.6.8.7z` (`.7z`, invisible
  to the picker). The full-bundle naming convention applies from **v0.6.9**; the
  `.7z` format makes the name irrelevant to safety.
