# Fork 維護策略（hermes-web-ui-portable）

> 單一真相文件。每次考慮「要不要同步上游」時，先讀這份，照表操課。
> 記憶不可靠，這份文件才是錨點。

## 背景

- **我們的 fork**：`dseditor/hermes-web-ui-portable`（origin）
- **上游**：`EKKOLearnAI/hermes-web-ui`（upstream）
- **共同祖先（merge-base）**：`8dbf4c74394fcca964cbb6df08c0aca17c7e22a0`
- **版本基準（2026-06-04）**：我們 `0.6.8`、上游 `0.6.10`（落後 47 commits）

### 為什麼不能整批 merge

`git merge upstream/main` 會一次引爆三類衝突（server 結構 / 外殼 / models 立場），
且把我們**刻意移除的東西帶回來**（見下方 apikey.fun）。47 個 commit 裡一大半是
**desktop 桌面版修補**，我們走 portable 根本不需要。所以策略是**分層、選擇性 cherry-pick**，
不是整批合併。

---

## 核心原則：分層維護

把程式碼分成四層，各有固定處置方式。

### 第 1 層：自己打造，凍結不跟上游（我們的身分與立場）

這是我們之所以是「我們」的部分。上游就算改了也忽略；要動只手動、小範圍 cherry-pick。

| 區域 | 代表檔案 | 為什麼凍結 |
|------|---------|-----------|
| 前端外殼 / 導航 | `App.vue`、`components/layout/AppSidebar.vue`、`SessionListPanel.vue`、`views/hermes/SettingsView.vue`（導航部分）、`SessionListItem.vue`、`router/index.ts` | context-aware 雙模式側欄是我們的設計，上游 layout 只小動，不值得為它放棄 |
| 主題 | `styles/variables.scss`、`styles/theme.ts` | 墨黑+朱印紅 / design-studio 兩色調是品牌識別 |
| 頭像 | `components/hermes/profiles/ProfileAvatar.vue` | 我們走 emoji；⚠️ 與上游 #1273 衝突（見熱點） |
| **模型 / Provider 清單** | `shared/providers.ts`、`utils/providerBaseUrl.ts`、`components/hermes/models/ProviderFormModal.vue`、`views/hermes/ModelsView.vue` | ⚠️ **立場對立**：上游 #1266 把 apikey.fun 導向 presets（商業推廣），我們 `fb4ec4c` 刻意**移除 apikey.fun 推廣**、重排 provider、加 NVIDIA/OpenAI。同步上游 = 把 apikey.fun 帶回來。**絕不整批跟。** |
| Portable / Remote 基建 | server 的 remote/pairing/tunnel/update、`docker-compose*.yml`、`apply-update.*`、`PORTABLE_RELEASE.md` | 結構性客製，與上游後端重構衝突最硬 |

### 第 2 層：選擇性追隨上游（cherry-pick）

上游的內頁通用功能 / bug fix，我們大多沒碰，可乾淨吸收。逐一 cherry-pick，個別解小衝突。
**挑選時避開**：帶 apikey.fun 的、純 desktop 的、動到第 1 層檔案的。

### 第 3 層：完全不跟

| 區域 | 原因 |
|------|------|
| Desktop 桌面版（`packages/desktop`，上游 29 檔） | 我們走 portable，tray icon / 打包 / 簽章修補全部無關 |
| 測試（`tests/`，上游 28 檔） | 隨對應功能一起評估，不單獨拉 |

### 第 4 層：無交集（安全）

- **外掛程式 / Plugins**：上游 `0.6.10` **完全沒動** plugins。我們的 plugins 客製
  （`PluginsView`、`api/hermes/plugins`、server plugins）**不受影響**，無需任何動作。

---

## 衝突熱點（同步前必先決策）

1. **頭像**：上游 #1273「使用者頭像上傳 + 群聊頭像同步」 ↔ 我們 emoji 路線。
   - 我們的 `ProfileAvatar` 仍保留 `type==='image'` 上傳分支，可共存；但群聊頭像同步是新功能，要單獨評估。
2. **模型 / Provider**：上游 #1266 apikey.fun presets ↔ 我們 `fb4ec4c` 移除 apikey.fun。
   - **決策：models/provider 維持自製，不跟上游這條線。** 需要上游的 provider bug fix（如 #1236 auth scoping）時手動挑、且剔除 apikey.fun 部分。
3. **i18n**（`locales/en|zh-TW|zh.ts`）：雙方都加 key，文字衝突，易解。
4. **server 後端**：我們 remote 結構 ↔ 上游後端重構。只在安全/重大修補時手動移植。

---

## 同步操作流程（標準步驟）

```bash
# 1. 抓上游
git fetch upstream

# 2. 看上游帶來什麼（只看與 portable 相關的）
git log --oneline 8dbf4c7..upstream/main | grep -ivE "desktop|tray|signing|packaging"

# 3. 針對單一想要的 commit，cherry-pick（不整批 merge）
git cherry-pick <hash>
#   衝突時：若落在第 1 層檔案 → 保留我們的；若是 apikey.fun → 剔除

# 4. 驗證（務必雙綠燈）
npx vue-tsc -b && npx vite build

# 5. 因為 8648 跑的是 dist/server，純前端改動也要 build 才會生效
```

> ⚠️ 部署提醒：`:8648` 跑的是 `dist/server/index.js`（production 產物），
> **不是 vite dev HMR**。任何改動都要 `vite build` 後重整才看得到。

---

## 0.6.10 內頁功能候選（第 2 層）

| Commit | 功能 | 風險 | 狀態 |
|--------|------|------|------|
| b569320 #1296 | 分頁標題反映 session 名稱 | 低 | ✅ 已移植 `0f321a7` |
| ae38921 #1279 | Kanban 顯示 task ID / parent task ID | 低 | ✅ 已移植 `9aacb71` |
| efca285 #1195 | memory 允許空內容儲存 | 低 | ✅ 已移植 `73697d9` |
| 3f7242a #1197 | 修正手機虛擬鍵盤版面溢出 | 低 | ✅ 已移植 `e978740` |
| b00ada4 #1236 | provider auth profile scoping 修正 | 中 | ✅ 已移植 `f5c1646`（providers.ts 衝突 4 處 → 保留我們清單、只收 auth 邏輯，無 apikey.fun） |
| e664845 #1263 | 輔助模型壓縮設定（省 token） | 中 | ✅ 已移植 `eb083c4`（ru.ts 保持刪除） |
| 1fbbfdf #1184 | 優先採用 provider context 長度 | 中 | ⏭️ **刻意跳過**：上游指定的模型 context 常太小、不夠 agent 用，context 長度由我們自控 |
| fd2b42a #1262 | 工作區文字檔預覽 | 中 | ⏸️ 未取（我們已有 Preview tab，需確認不重複再決定） |
| f978a5b #1311 | 工作區資料夾選擇器 i18n | 低 | ⏸️ 未取（看 FolderPicker 中文有無缺字再決定） |

> 移植原則：逐一 cherry-pick，每個都跑三層驗證再進下一個 —— `vue-tsc -b`、`vite build`、`tsc -p packages/server/tsconfig.json`。碰 server 的還要 `node scripts/build-server.mjs` 重建 dist/server，且**重啟 :8648 進程**才生效。

## 移植記錄

- **2026-06-04**：從 0.6.10 移植 6 個內頁功能（上表 ✅）。共同祖先仍是 `8dbf4c7`（用 cherry-pick 未動 merge-base）。三層編譯全綠。衝突兩處均手解：#1236 providers.ts 保留我方清單、#1263 ru.ts 保持刪除（fork 不含俄文）。

## 未來想法（backlog，待研究）

- **自動化審核排程**：設一個 Claude 排程，讓無頭 AI 依本文件的標準，定期掃描上游新 commit、自動篩出「綠色（低風險、與我們客製無交集）」候選並驗證導入。需先把「綠色判定準則」寫得夠機械化（領域分布、重疊檔、apikey.fun/desktop 排除規則），AI 才能照表執行。（主人 2026-06-04 提出）
