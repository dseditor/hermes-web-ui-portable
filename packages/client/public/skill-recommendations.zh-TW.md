# Skills 推薦清單

這是一份適合 Hermes、Claude Code、Codex 類本地 Agent 工作流的社群 Skill 推薦清單。它主要用於幫助你發現可安裝、可參考或可改造的 Skill 來源。

社群 Skill 本質上是第三方指令和程式碼。安裝前請先審計，尤其是會讀取 API Key、Cookie、瀏覽器登入態、本地檔案、倉庫內容，或者會執行 shell、安裝依賴、自動發帖、訪問外部 API 的 Skill。

歡迎大家推薦各種好用的 Skill。如果你發現值得收錄的高質量 Skill，可以到 GitHub 提交 PR，並附上倉庫連結、適用場景和必要的安全說明。

## 維護規範

- 這份文件只維護中文內容；英文版請同步維護 `skill-recommendations.en.md`。
- 新增推薦時優先放入最接近的現有分類，不要輕易新增大類。
- 每個條目儘量保持同一結構：倉庫連結、方向、適合場景、代表 Skills 或能力、必要備註。
- 描述要簡潔、事實化，優先依據倉庫 README、`SKILL.md`、示例或包後設資料，不寫無法驗證的宣傳語。
- 不要寫入金鑰、私有 token、會自動執行遠端程式碼的安裝命令，或無法確認來源的內容。
- 涉及安全風險的 Skill 要明確說明上下文，例如是否會訪問憑據、瀏覽器、本地檔案、shell、包管理器、外部 API 或社交賬號。
- 前端只維護中文和英文兩份推薦文件，其他語言統一回退到英文版。

## 安全優先

- 預設把所有第三方 Skill 當成不可信內容，審計後再啟用。
- 安裝前閱讀 `SKILL.md`、指令碼、hooks、依賴安裝邏輯和外掛配置。
- 對會訪問瀏覽器、讀取憑據、執行 shell、安裝 npm/pip/brew 依賴、自動發帖或上傳本地檔案的 Skill 保持謹慎。
- 建議先在一次性 profile 或沙盒專案裡測試新 Skill。
- 可以使用 SlowMist Agent Security 這類安全審計 Skill 來檢查陌生倉庫、URL、MCP、Skill 包和鏈上地址。

## 官方與通用 Skills

### Anthropic 官方 Skills

- 倉庫：[anthropics/skills](https://github.com/anthropics/skills/tree/main/skills)
- 方向：Claude 官方參考 Skill。
- 適合：學習標準 Skill 結構、參考穩定實現、搭建通用工作流。
- 代表 Skills：`docx`、`pdf`、`pptx`、`xlsx`、`frontend-design`、`webapp-testing`、`skill-creator`、`mcp-builder`、`theme-factory`、`web-artifacts-builder`。
- 備註：如果你想找保守、規範、可參考的 Skill 示例，優先看這個。

### Matt Pocock Skills

- 倉庫：[mattpocock/skills](https://github.com/mattpocock/skills)
- 方向：工程與生產力工作流。
- 適合：TypeScript 工程、TDD、問題診斷、程式碼評審、原型開發、PRD/Issue/Handoff 等開發流程。
- 代表 Skills：`tdd`、`triage`、`diagnose`、`prototype`、`review`、`to-prd`、`to-issues`、`handoff`、`write-a-skill`。
- 備註：適合希望 Agent 更像工程協作者時使用。

## 設計、幻燈片與視覺化

### Frontend Slides

- 倉庫：[zarazhangrui/frontend-slides](https://github.com/zarazhangrui/frontend-slides)
- 方向：用前端技術生成網頁幻燈片。
- 適合：HTML/CSS 幻燈片、視覺敘事、瀏覽器渲染的演示稿。
- 備註：適合把演示稿當成 Web Artifact 來做，而不是傳統 Office 檔案。

### 華叔 Design

- 倉庫：[alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design)
- 方向：Claude Code 中的 HTML 原生設計 Skill。
- 適合：高保真原型、幻燈片、動畫概念、視覺評審和匯出型設計流程。
- 備註：包含設計哲學、評審維度和演示型工作流。

### 歸藏 PPT Skill

- 倉庫：[op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill)
- 方向：生成高質量 HTML 幻燈片。
- 適合：雜誌風、編輯風、瑞士風等視覺風格的演示稿、社交封面、圖片提示詞和敘事型頁面。
- 備註：包含演示執行時和風格化生成模式。

### HTML PPT Skill

- 倉庫：[lewislulu/html-ppt-skill](https://github.com/lewislulu/html-ppt-skill)
- 方向：HTML PPT Studio。
- 適合：主題化幻燈片、複雜佈局演示稿和帶動畫的瀏覽器演示。
- 代表能力：多主題、多佈局、動畫模式和 HTML 演示腳手架。

### PPT Image First

- 倉庫：[NyxTides/ppt-image-first](https://github.com/NyxTides/ppt-image-first)
- 方向：圖片優先的 PPT 生成。
- 適合：視覺方向先行的演示稿創作。
- 備註：面向 Codex、Claude Code、OpenCode CLI 等 Agent 工作流。

### GPT Image To PPT

- 倉庫：[JuneYaooo/gpt-image2-ppt-skills](https://github.com/JuneYaooo/gpt-image2-ppt-skills)
- 方向：用影象生成能力復刻或改造 PPT 視覺版式。
- 適合：從已有 `.pptx` 模板中學習版式，再替換成自己的內容。
- 備註：涉及影象生成和外部 API 時請先檢查配置與資料傳送邏輯。

### Fireworks Tech Graph

- 倉庫：[yizhiyanhua-ai/fireworks-tech-graph](https://github.com/yizhiyanhua-ai/fireworks-tech-graph)
- 方向：技術圖表生成。
- 適合：架構圖、流程圖、UML 風格圖、AI Agent 工作流圖，以及 SVG/PNG 輸出。
- 備註：需要圖表而不是整套演示稿時很實用。

### Diagram Skill

- 倉庫：[312362115/claude diagram skill](https://github.com/312362115/claude/blob/main/skills/diagram/SKILL.md)
- 方向：結構化圖表生成。
- 適合：生成圖表、模板化視覺解釋和技術說明。
- 備註：這是一個直接指向 `SKILL.md` 的連結，安裝前也要檢查同目錄下的 `references`、`scripts` 和 `templates`。

## 寫作、文件與知識工作

### 華叔 Markdown To HTML

- 倉庫：[alchaincyf/huashu-md-html](https://github.com/alchaincyf/huashu-md-html)
- 方向：Markdown 與 HTML 雙向轉換流水線。
- 適合：把檔案或網頁轉 Markdown，把 Markdown 轉精美 HTML，把 HTML 再轉回 Markdown。
- 代表工具：MarkItDown、Pandoc、html-to-markdown、trafilatura。
- 備註：適合內容釋出、文件清理和 HTML 頁面生成。

### 中文網文寫作 Skill

- 倉庫：[Tomsawyerhu/Chinese-WebNovel-Skill](https://github.com/Tomsawyerhu/Chinese-WebNovel-Skill)
- 方向：中文網文小說寫作。
- 適合：長篇小說規劃、章節創作、風格延續和網文式敘事。
- 代表 Skill：`webnovel-writing`。

### 軟體著作權材料 Skill

- 倉庫：[Fokkyp/SoftwareCopyright-Skill](https://github.com/Fokkyp/SoftwareCopyright-Skill)
- 方向：中國軟體著作權申請材料生成。
- 適合：根據本地專案生成 `.docx` 軟著申請材料。
- 代表 Skills：`software-copyright-materials`、`docx-toolkit`。
- 備註：可能讀取本地專案檔案，執行前請審計檔案訪問和文件生成邏輯。

### 專利交底書 Skill

- 倉庫：[handsomestWei/patent-disclosure-skill](https://github.com/handsomestWei/patent-disclosure-skill)
- 方向：專利技術交底書生成。
- 適合：從專案文件挖掘專利點、聯網查新、脫敏成文和自檢。
- 備註：可能涉及敏感技術資料和聯網檢索，使用前請關注資料處理方式。

## 圖片、媒體與社交發布

### 寶玉 Skills

- 倉庫：[JimLiu/baoyu-skills](https://github.com/JimLiu/baoyu-skills)
- 方向：圖片生成、內容轉換、釋出和媒體工作流。
- 適合：圖片卡片、文章配圖、幻燈片、URL 轉 Markdown、YouTube 字幕、Markdown 轉 HTML、社交平臺釋出。
- 代表 Skills：`baoyu-image-gen`、`baoyu-imagine`、`baoyu-slide-deck`、`baoyu-markdown-to-html`、`baoyu-post-to-x`、`baoyu-post-to-wechat`、`baoyu-post-to-weibo`、`baoyu-url-to-markdown`、`baoyu-youtube-transcript`、`baoyu-translate`、`baoyu-diagram`、`baoyu-comic`。
- 安全提示：發帖和網頁讀取類 Skill 可能訪問賬號會話、Cookie、瀏覽器狀態或外部 API，使用前務必審計。

### Virtual Couple Travel Vlog

- 倉庫：[vibeshotclub/vsc-skills / virtual-couple-travel-vlog](https://github.com/vibeshotclub/vsc-skills/tree/main/virtual-couple-travel-vlog)
- 方向：旅行 vlog 風格媒體生成。
- 適合：短影片視覺敘事、角色化旅行內容和可複用媒體提示詞。
- 備註：這是一個大倉庫裡的子目錄 Skill。

## Web 訪問、研究與內容監控

### Web Access

- 倉庫：[eze-is/web-access](https://github.com/eze-is/web-access)
- 方向：為 Agent 提供結構化聯網能力。
- 適合：網頁研究、瀏覽器輔助任務、並行資訊收集和需要互動的網站。
- 安全提示：瀏覽器訪問可能暴露已登入狀態和本地瀏覽器資料，啟用前要審計。

### OpenCLI

- 倉庫：[jackwener/opencli](https://github.com/jackwener/opencli)
- 方向：把網站、瀏覽器會話、Electron 應用和本地工具轉換成 CLI 可呼叫的自動化入口。
- 適合：讓 Agent 操作已登入的 Chrome 頁面、編寫可複用網站介面卡、封裝本地命令，以及把瀏覽器流程變成穩定命令。
- 代表 Skills：`opencli-browser`、`opencli-adapter-author`、`opencli-autofix`、`opencli-usage`。
- 安全提示：瀏覽器命令可能使用已登入會話和本地瀏覽器狀態。啟用前請審計擴充套件、daemon、介面卡和生成的命令，敏感 profile 裡尤其要謹慎。

### Follow Builders

- 倉庫：[zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders)
- 方向：跟蹤 AI builders 的 X、部落格和 YouTube 播客內容。
- 適合：關注 builder 而不是 influencer，生成摘要和內容 digest。
- 代表內容：X feed、blog feed、podcast feed、prompts 和狀態檔案。
- 安全提示：社交和 feed 自動化要關注賬號、Cookie 和訪問許可權。

### SlowMist Agent Security

- 倉庫：[slowmist/slowmist-agent-security](https://github.com/slowmist/slowmist-agent-security)
- 方向：AI Agent 安全審計框架。
- 適合：檢查 Skill、MCP、倉庫、URL、Prompt 和鏈上地址的安全風險。
- 核心原則：所有外部輸入在驗證前都不可信。
- 備註：安裝陌生社群 Skill 前建議優先使用。

## Persona、思維方式與顧問類 Skills

### 華叔 Nuwa Skill

- 倉庫：[alchaincyf/nuwa-skill](https://github.com/alchaincyf/nuwa-skill)
- 方向：把某個人或視角蒸餾成可複用 Skill。
- 適合：顧問團式思考、心智模型、決策啟發式和特定視角寫作。
- 代表視角：華叔 Nuwa、Feynman、Jobs、Musk、Naval、Paul Graham、Taleb。
- 備註：適合頭腦風暴和視角模擬，不應當作事實權威。

### PUA / 反 PUA 類 Skills

- 倉庫：[tanweai/pua](https://github.com/tanweai/pua)
- 方向：高能動性、強反饋、反操控或尖銳教練風格的 Agent 行為。
- 適合：動機強化、批判反饋、反操控和刻意強風格互動。
- 代表 Skills：`pua`、`pua-en`、`pua-ja`、`pua-loop`、`mama`、`p7`、`p9`、`p10`、`pro`、`shot`、`yes`。
- 備註：這類 Skill 會明顯改變語氣和互動方式，不建議直接用於共享或面向使用者的環境。

### Ex Skill

- 倉庫：[therealXiaomanChu/ex-skill](https://github.com/therealXiaomanChu/ex-skill)
- 方向：把某個前任/人格風格蒸餾成 AI Skill。
- 適合：Persona 實驗、情緒化角色扮演和特定語氣模擬。
- 代表 Skill：`create-ex`。
- 備註：Persona 類 Skill 可能強烈影響語氣和情緒框架，使用前請確認場景合適。

## 快速推薦

如果你只想先裝一批實用的，可以從這些開始：

- [Anthropic 官方 Skills](https://github.com/anthropics/skills/tree/main/skills)：參考實現和通用能力。
- [Matt Pocock Skills](https://github.com/mattpocock/skills)：工程流程。
- [寶玉 Skills](https://github.com/JimLiu/baoyu-skills)：圖片、媒體和釋出。
- [華叔 Design](https://github.com/alchaincyf/huashu-design)：高保真 HTML 設計。
- [歸藏 PPT Skill](https://github.com/op7418/guizang-ppt-skill) 或 [HTML PPT Skill](https://github.com/lewislulu/html-ppt-skill)：瀏覽器演示稿。
- [華叔 Markdown To HTML](https://github.com/alchaincyf/huashu-md-html)：Markdown/HTML 文件轉換。
- [Web Access](https://github.com/eze-is/web-access)：網頁研究。
- [OpenCLI](https://github.com/jackwener/opencli)：已登入瀏覽器自動化和可複用網站 CLI 介面卡。
- [Fireworks Tech Graph](https://github.com/yizhiyanhua-ai/fireworks-tech-graph)：技術圖表。
- [SlowMist Agent Security](https://github.com/slowmist/slowmist-agent-security)：社群 Skill 安全審計。

## 來源說明

本文件基於一份 Hermes / Claude Skills 分享清單整理，並補充了公開 GitHub 倉庫描述與目錄資訊。
