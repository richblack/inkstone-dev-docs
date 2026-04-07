[← 回到首頁](./README.md)

# u6u 開發者指南 {#top}

u6u 是 **AI 優先（AI-first）**的工作流平台。不是在 App 裡加一個 AI 聊天視窗——而是反過來，**AI 是核心，工作流是 AI 寫好的程式庫**。

傳統自動化工具：人設計流程圖 → AI 插入其中某個節點。

u6u：AI 解析你的意圖 → AI 設計工作流 → 存起來 → 之後直接呼叫，不需要每次重新思考。

**工作流是 AI 的已編譯程式，不是人畫給 AI 看的流程圖。**

這個板子天生供電——插上去的任何零件都能被 AI 調用，不需要在每個零件裡再裝一顆電池。

---

## 快速開始 {#quick-start}

先跑，後解釋。

**第一步：看有哪些零件（無需認證）**

```bash
# 方式 A：列出所有零件
curl https://registry.finally.click/components

# 方式 B：用 Cypher 搜尋（推薦，會自動補全已知節點）
curl -X POST https://workflow.finally.click/cypher/search \
  -H "Content-Type: application/json" \
  -d '{
    "triplets": [
      "start >> 完成後 >> http-request"
    ]
  }' | jq '.nodes | keys'
```

**第二步：跑一個工作流——打 httpbin.org 確認它真的執行了**

```bash
curl -X POST https://workflow.finally.click/cypher/execute \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "triplets": [
      "start >> 完成後 >> http-request",
      "http-request >> 完成後 >> done"
    ],
    "context": {
      "url": "https://httpbin.org/post",
      "method": "POST",
      "body": { "hello": "u6u" }
    }
  }'
```

**第三步：看到結果**

你會看到 httpbin 的回傳，代表 u6u 幫你打了那個 API。同時注意回應的 `version` 和 `timestamp` 欄位：

```json
{
  "version": "execute-v1-20260402-103244",
  "timestamp": "2026-04-02T10:32:44.908Z",
  "success": true,
  "data": {
    "url": "https://httpbin.org/post",
    "json": { "hello": "u6u" },
    "status_code": 200
  },
  "trace": [
    { "nodeId": "start", "type": "Input", "output": {...} },
    { "nodeId": "http-request", "type": "Component", "output": {...} },
    { "nodeId": "done", "type": "Output", "output": {...} }
  ],
  "duration_ms": 245
}
```

**版本號說明（對開發者友善）：**
- `version` 格式：`{endpoint}-v{major}-{YYYYMMDD-HHMMSS}`，用來追蹤 API 呼叫版本
- `timestamp` 是 ISO 8601 格式，便於 Markdown 文檔追蹤
- 這兩個欄位允許你把整個回應複製貼進本地 Markdown 檔案，用版本號區分多次迭代

三行指令就跑完了一個真實的工作流。接下來用「**呼叫公開 API 取得匯率，有變動才通知**」這個例子，一步一步展開所有概念。

---

## 本地開發：使用 Markdown 文檔迭代 {#local-development}

u6u 設計給工程師在 VSCode 中直接開發——用 Markdown 文檔記錄整個工作流從設計到執行的過程。不需要網頁介面，純 Markdown + curl 指令。

### 工作流程

#### 第一步：建立本機目錄結構

```bash
mkdir -p my-workflows/workflows my-workflows/components
cd my-workflows
```

#### 第二步：新建工作流文檔

使用模板快速開始，複製 [`/templates/workflow-simple.template.md`](../../templates/workflow-simple.template.md)：

```bash
cp templates/workflow-simple.template.md workflows/my-exchange-rate-checker.md
```

編輯 YAML frontmatter：

```yaml
---
name: fetch-exchange-rate
type: workflow
version: 0.1.0
---
```

編輯工作流意圖和步驟：

```markdown
## 意圖

取得美元兌台幣的即時匯率。

**輸入**：無

**輸出**：USD/TWD 的目前匯率和時間戳

**業務邏輯**：呼叫 fixer.io API 取得匯率，解析回應

## 步驟

- get-exchange-rate：從 fixer.io 查詢美元對台幣匯率
- format-result：格式化結果並加上時間戳
```

#### 第三步：執行搜尋，貼入回應

執行以下命令（把 URL 和 triplets 改成你的）：

```bash
curl -X POST https://workflow.finally.click/cypher/search \
  -H "Content-Type: application/json" \
  -d '{
    "triplets": [
      "start >> 完成後 >> get-exchange-rate",
      "get-exchange-rate >> 完成後 >> format-result",
      "format-result >> 完成後 >> end"
    ],
    "auto_publish": true
  }'
```

整個 JSON 回應（包含 `version` 和 `timestamp`）直接貼進文檔的「搜尋結果」區塊。**注意 `auto_published` 區塊的 `temporary_endpoint` 和 `implement_by`**——這表示有 24 小時的時間實作缺失的零件：

```json
{
  "version": "search-v1-20260402-103500",
  "timestamp": "2026-04-02T10:35:00.123Z",
  "nodes": {
    "get-exchange-rate": {
      "status": "missing",
      "type": "Component"
    }
  },
  "auto_published": {
    "get-exchange-rate": {
      "ok": true,
      "componentId": "get-exchange-rate",
      "temporary_endpoint": "https://pms-custom.uncle6-me.workers.dev/get-exchange-rate-temp",
      "implement_by": "2026-04-03T10:35:00.123Z"
    }
  }
}
```

#### 第四步：實作缺失零件

如果搜尋結果裡有 `missing` 零件，在 `components/` 新增一個：

```bash
cp templates/component-simple.template.md components/get-exchange-rate.md
```

編輯零件文檔，填入輸入/輸出 schema 和實作細節。

#### 第五步（如需要）：建立並提交自己的零件

如果你想建立缺失的零件（而不是等待別人），參考 [零件建立完整指南](#零件建立完整指南) 章節。

簡單流程：
1. 複製 `templates/component-simple.template.md`
2. 用搜尋結果裡的 `component_id` 命名（例如 `components/abc-def-123.md`）
3. 選擇實作方式：
   - **方式 A**：寫個 API endpoint，curl 打一下就 HTTP 200
   - **方式 B**：寫 Gherkin 測試，系統自動跑驗證
4. 提交：`curl POST /components/submit`
5. 驗收通過 → endpoint 正式上線
6. 重新搜尋工作流 → 缺件已解決 ✅

#### 第六步：執行工作流

一旦所有零件都有（官方零件或自己建的），執行：

```bash
curl -X POST https://workflow.finally.click/cypher/execute \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "triplets": [
      "start >> 完成後 >> get-exchange-rate",
      "get-exchange-rate >> 完成後 >> format-result",
      "format-result >> 完成後 >> end"
    ],
    "context": {}
  }'
```

把整個回應貼進「執行記錄」區塊。每次執行都有新的 `version` 和 `timestamp`，用版本號追蹤迭代。

### 版本控制的含義

**版本號帶時戳，允許你追蹤迭代歷史：**

- `search-v1-20260402-103244` — 第一次搜尋
- `search-v1-20260402-105500` — 後來又執行搜尋（發現缺件已解決）
- `execute-v1-20260402-110000` — 第一次執行

Markdown 文檔本身用 git 管理，每次重要的迭代都 commit。API 回應的版本號和時戳幫你對應「我在 git 的哪個 commit 時執行的這個 API 呼叫」。

### 完整例子

見 [`/examples/workflows/fetch-exchange-rate.md`](../../examples/workflows/fetch-exchange-rate.md)——實際的工作流文檔範例，包含搜尋結果、執行記錄、缺失零件清單。

---

## 零件建立完整指南 {#component-creation}

### 什麼時候需要自己建零件？

- 搜尋發現缺零件，沒人提交（等不及）
- 想貢獻官方零件庫（成為貢獻者）
- 有特殊業務邏輯只有你能實現

### 建立流程

#### 第一步：從搜尋結果取得 component_id

```json
{
  "missing": [
    {
      "name": "get-exchange-rate",
      "component_id": "abc-def-123-uuid"
    }
  ]
}
```

複製 `component_id`（這是 UUID，確保全域唯一）。

#### 第二步：建立零件文檔

```bash
cp templates/component-simple.template.md components/abc-def-123.md
```

編輯檔案，填入：
- 零件名稱和描述
- 輸入 / 輸出 schema（JSON）
- 實作方式（見下方兩種選擇）

#### 第三步：選擇實作方式

**方式 A：API Endpoint（推薦快速）**

寫一個簡單的 HTTP endpoint，接收 JSON，回傳 JSON。

```typescript
// Cloudflare Worker 範例
export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const input = await request.json();
    
    // 你的業務邏輯
    const rate = 32.5;
    const timestamp = new Date().toISOString();

    return new Response(
      JSON.stringify({ rate, timestamp }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

部署到 URL（例如 `https://my-worker.example.com/abc-def-123`）。

**方式 B：Gherkin 測試（推薦複雜邏輯）**

寫 scenario 描述功能，系統自動驗收。

```gherkin
Feature: 取得匯率
  Scenario: 正常查詢
    Given 發送請求
    When 調用取得匯率
    Then 回傳 rate 欄位數字
    And 回傳 timestamp 欄位字串

  Scenario: 邊界值
    Given 發送請求
    When 調用取得匯率
    Then rate > 0
```

#### 第四步：提交驗收

**API 方式：**

```bash
curl -X POST https://workflow.finally.click/components/submit \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "component_id": "abc-def-123",
    "endpoint": "https://my-worker.example.com/abc-def-123"
  }'
```

系統會：
1. 連線到你的 endpoint
2. 發送測試請求
3. 收到 HTTP 200 就 ✅ 發布
4. 其他狀態碼就 ❌ 失敗（會告訴你錯誤）

**Gherkin 方式：**

```bash
curl -X POST https://workflow.finally.click/components/submit \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "component_id": "abc-def-123",
    "gherkin": "Feature: 取得匯率\n  Scenario: ..."
  }'
```

系統會：
1. 執行所有 scenario
2. 全部通過就 ✅ 發布
3. 任何失敗列出哪個 scenario 沒過

#### 第五步：確認發布

收到成功回應：

```json
{
  "status": "published",
  "endpoint": "https://registry.finally.click/abc-def-123",
  "expires_at": "2026-05-02T11:00:00Z"
}
```

恭喜！你的零件現在進入官方零件庫了。

#### 第六步：工作流自動更新

重新搜尋工作流：

```bash
curl -X POST https://workflow.finally.click/cypher/search ...
```

會發現缺件已解決：

```json
{
  "nodes": {
    "get-exchange-rate": {
      "status": "found",
      "componentId": "abc-def-123"
    }
  }
}
```

執行工作流，自動用你發布的零件。

### 零件有效期和清理

- **待提交**：提交前有 30 天時間，超過就刪除 UUID（下次搜尋重新生成）
- **已發布**：有 30 天有效期，如果在期間內被工作流引用，自動延期
- **未使用**：30 天未被任何工作流引用，自動刪除
- **目的**：防止 ID 堆積，只保留有用的零件

---

## 核心概念 {#concepts}

### 圖（Graph）

整個捷運路網就是一張圖——每個車站是節點，站與站之間的連線是關係。u6u 的工作流也是一張圖：每個執行步驟是一個站，執行順序是連線。你規劃的工作流就是一條你選好的路線，從起點站跑到終點站。

### 語義查詢（Cypher）

Cypher 是查詢路網的語言，就像你說「從台北車站到信義安和，中間要換幾次線？」——你描述想走的路徑，系統幫你找答案。在 u6u 裡，你不需要學完整 Cypher 語法，只需要用 `>>` 描述關係：

```
節點A >> 關係描述 >> 節點B
```

### 三元組（Triplet）

`A >> 關係 >> B` 就是「從 A 站搭到 B 站，中間做什麼」，這就是一個三元組（Triplet），是工作流的最小單位。

例如 `台北車站 >> 搭板南線 >> 忠孝復興` 是一個三元組。多條三元組串起來就是整條路線：

```json
{
  "triplets": [
    "start >> 完成後 >> 取得匯率",
    "取得匯率 >> 完成後 >> 比較變動",
    "比較變動 >> 條件滿足時 >> done"
  ]
}
```

**每條三元組只有三段。** 嚴禁在一條字串裡寫四段以上：

```
❌ "start >> 完成後 >> 取得匯率 >> 完成後 >> 比較變動 >> 條件滿足時 >> done"
```

這樣系統無法解析，而且違背「一條三元組就是一個步驟」的概念。正確做法是拆成多條，每條只有三段，名稱相同的節點會自動串接。

### 零件（Component）

每個車站都有說明牌——它在哪、能做什麼、進站要帶什麼、出站給你什麼。u6u 的零件（Component）就是這塊說明牌，描述這個步驟的行為。u6u 根據你寫的站名，從零件庫找到對應的說明牌，按照說明執行。

零件有兩種：

- **內建邏輯零件**：`filter`（條件過濾）、`switch`（多路分支）、`set`（設定欄位）等，系統直接處理，不呼叫外部 API
- **呼叫型零件**：呼叫一個 HTTPS endpoint，例如 `http-request`（打任意 API）、`telegram`（發訊息）

### 工作流（Workflow）

整條你規劃好的路線，從起點站跑到終點站，就是一個工作流。用多條三元組描述，每條說明兩個相鄰站之間的關係。

### 執行順序

```
start >> 完成後 >> 你的零件
你的零件 >> 完成後 >> done
  ↑               ↑          ↑
起點          真正執行      終點
只設初始值    呼叫你的 API  只收結果
```

起點和終點不呼叫任何東西。**至少要三個節點，中間那個才會被執行。** 如果只有兩個節點，什麼都不會發生。

---

## 圖形即語義 {#visual-semantics}

傳統工作流工具（包含 n8n）一律用方塊表示節點——起點、終點、條件、動作，全部都是方塊，差別只在 label 文字。你必須讀文字才能理解流程，圖形本身沒有意義。

u6u 採用 UML 活動圖的圖形語義。**圖形本身就是語義，不需要讀 label。**

### 節點圖形對照

| 圖形 | 名稱 | u6u 對應零件 | 語義 |
|------|------|------------|------|
| ● | 實心圓 | `start` | 起點，初始化 context |
| ◎ | 雙環圓 | `done` | 終點，工作流結束 |
| ▭ | 圓角矩形 | 一般零件（`http-request`、`gmail`…） | 動作，執行一件事 |
| ◇ | 菱形 | `filter`、`switch` | 決策，依條件分岔 |
| ▬ | 水平粗條 | `merge` | 同步，等所有並行分支完成 |
| 🤖 | Agent 圖示 | `ai-agent` | AI 決策中樞 |

### 邊（連線）的語義

傳統工具：兩個節點之間只有一條線，線是「接起來」的意思。

u6u：兩個節點之間的連線必須有關係描述——也就是三元組的中間段。**每條線都說明「為什麼」從 A 到 B，不只是「有連」。**

```
取得匯率 >> 完成後 >> filter        ← 「完成後」= 正常執行流
filter >> 條件滿足時 >> http-request ← 「條件滿足時」= 條件分支
filter >> 條件不符時 >> done         ← 「條件不符時」= 另一條分支
ai-agent >> 查詢匯率 >> get-rate     ← 「查詢匯率」= AI 選擇的工具名稱
```

菱形節點（`filter`、`switch`）的出口邊名稱就是條件描述。AI Agent 節點的出口邊名稱就是 AI 可以呼叫的動作名稱。**邊的文字 = 程式邏輯，不是裝飾。**

### 為什麼這和 AI 優先有關

AI 生成 triplet：

```
start >> 完成後 >> get-exchange-rate
get-exchange-rate >> 完成後 >> filter
filter >> 條件滿足時 >> http-request
http-request >> 完成後 >> done
```

系統把這四條 triplet 直接渲染成 UML 活動圖——因為 triplet 的結構本來就是圖的邊（edge）。AI 不需要學習「怎麼畫流程圖」，只需要寫出符合語義的三元組，圖自然生成。

**AI 寫 triplet → 系統渲染 UML → 人類看圖就懂，不需要解讀代碼。**

這是 Cypher、圖形語義、AI 優先三個原則的交匯點：語言（Cypher）和視覺（UML）表達的是同一件事。

---

## AI 優先開發 (MCP) {#ai-mcp}

u6u 不僅是為人類設計的，更是為 **AI 代理 (AI Agents)** 原生設計的。我們提供標準的 **Model Context Protocol (MCP)** 伺服器，讓 Claude.ai、Cursor 或任何支援 MCP 的工具能直接具備建立與管理工作流的能力。

### 連線資訊

若要在 AI 工具中啟用 u6u 插件，請設定以下 MCP Server：

- **類型**：`HTTP SSE`
- **URL**：`https://mcp.finally.click/sse`
- **認證**：請在 Headers 加入 `X-Api-Key: u6u_xxxxxxxx` (或 `Authorization: Bearer u6u_xxxxxx`)

### AI 具備的超能力 (Tools)

當你連接上 u6u MCP 後，AI 將獲得以下核心工具：

1.  **`u6u_search_components`**：AI 會將你的自然語言需求拆解為三元組 (Triplets)，並自動搜尋現有的零件庫。
    *   *情境*：「我想抓取 GitHub 資料並傳送到 Telegram」，AI 會呼叫此工具確認 `github-prs` 與 `telegram` 零件是否存在。
2.  **`u6u_execute_workflow`**：AI 可以在沙盒環境中即時測試它設計的工作流。
    *   *情境*：AI 設計好路徑後，會先注入測試資料跑一次，確保邏輯正確才回報給你。
3.  **`u6u_publish_workflow`**：當測試通過，AI 可以幫你正式發佈工作流，並設定 Webhook 或 Cron 排程。
4.  **`u6u_publish_component`**：如果發現缺件，AI 可以直接撰寫 Gherkin 劇本並發佈一個新的「AI 補完零件」。

### AI 開發流範例

當你在 Claude.ai 中與 u6u 互動時，典型的流程如下：

1.  **意圖解析**：你說出需求，AI 呼叫 `u6u_search_components` 掃描零件。
2.  **本地配置**：AI 在你的專案目錄 `.u6u/workflows/` 生成 YAML 定義檔（見 [Workflow as Code](#local-development)）。
3.  **即時驗證**：AI 呼叫 `u6u_execute_workflow` 進行雲端試跑。
4.  **正式部署**：AI 呼叫 `u6u_publish_workflow` 完成部署。

這意味著你只需要描述「想要什麼」，AI 就會完成從設計、搜尋、測試到部署的全過程，且所有過程都會以 YAML 檔案形式留在你的 Git 紀錄中。

---

## 內建零件清單 {#builtin-components}

### 流程管理

| 零件 ID | 名稱 | 說明 |
|---------|------|------|
| `filter` | 條件過濾 | 條件不符就停止，不繼續往下 |
| `switch` | 多路分支 | 依值走不同路徑 |
| `merge` | 合併等待 | 等多個並行分支完成後繼續 |
| `wait` | 等待 | 延遲指定毫秒後繼續 |

### 資料管理

| 零件 ID | 名稱 | 說明 |
|---------|------|------|
| `set` | 設定欄位 | 在工作流資料中新增或覆蓋欄位 |

### 認證管理

配方（Recipe）由兩部分組成：**公開部分**（endpoint、payload、http method）可以分享給任何人；**私密部分**（credential）只存在你自己這裡，分享時不會帶出去。

**第一步：把 secret 存進 u6u（一次性）**

```bash
curl -X POST https://credentials.finally.click/credentials \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "name": "my-gsheets-oauth",
    "type": "google_oauth",
    "secret": "ya29.xxxxxxxx"
  }'
```

回傳 `{ "id": "my-gsheets-oauth" }`，secret 加密後存入，之後不會再出現。

**第二步：工作流裡只寫 credential 名稱**

```json
{
  "triplets": [
    "start >> 完成後 >> google-sheets",
    "google-sheets >> 完成後 >> done"
  ],
  "context": {
    "credential": "my-gsheets-oauth",
    "spreadsheet_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    "range": "Sheet1!A1:C10"
  }
}
```

執行時 u6u 自動從你的 KV 取出 secret 注入，secret 永遠不出現在工作流定義裡。你把這個工作流分享給別人，對方只需要換成自己的 `credential` 名稱即可。

### 外部服務整合

每個外部服務是一組零件的集合，通常包含三個部分：

| 部分 | 說明 | 必要性 |
|------|------|--------|
| **http-request** | 呼叫該服務的 API endpoint | 必有 |
| **credential** | 存放該服務的認證（API Key、OAuth token） | 必有，除非服務不需要登入 |
| **trigger** | 監聽該服務的事件（webhook 或 cron 輪詢） | 選配 |

---

#### 通用（無需認證）

| 零件 ID | 說明 |
|---------|------|
| `http-request` | 呼叫任意公開 HTTPS API，萬能零件，快速上手從這裡開始 |

---

#### Google

| 零件 ID | 說明 | 認證類型 |
|---------|------|---------|
| `google-sheets` | 讀寫 Google Sheets | Google OAuth（credential 類型：`google_oauth`） |
| `gmail` | 發送 Gmail 郵件 | Google OAuth（credential 類型：`google_oauth`，scope: gmail.send） |

---

#### LINE

| 零件 ID | 說明 | 認證類型 |
|---------|------|---------|
| `line-notify` | 發送 LINE Notify 通知訊息 | LINE Channel Access Token（credential 類型：`line_token`） |

---

#### Telegram

| 零件 ID | 說明 | 認證類型 |
|---------|------|---------|
| `telegram` | 發送 Telegram 訊息到指定群組或頻道 | Bot token（credential 類型：`telegram_bot_token`） |

---

**配方（Recipe）** 是針對特定服務預設好的 http-request 組合——endpoint、headers、input/output schema 都設定好了，你只需要提供 credential 即可直接使用。例如「取得 GitHub PR 列表」就是一個 Recipe，任何人發布後所有人都能用，不需要再研究 GitHub API 文件。

取得任一零件的完整 schema：

```bash
curl https://registry.finally.click/components/guide
```

---

## AI Agent 零件 {#ai-agent}

`ai-agent` 是 u6u 的核心零件，也是「板子供電」概念的體現：**你不需要在每個零件裡分別整合 AI，只需要在工作流裡放一個 `ai-agent`，它就是整條流程的決策中樞。**

### 工作方式

```
Telegram Trigger >> 收到訊息 >> ai-agent
ai-agent >> 判斷後 >> 查詢資料庫
ai-agent >> 判斷後 >> 發送通知
ai-agent >> 判斷後 >> 更新試算表
```

`ai-agent` 收到輸入後，根據 `system_prompt` 定義的角色與工具，自己決定走哪條出口邊。出口邊的名稱就是 AI 可以呼叫的動作名稱。

### Context 欄位

| 欄位 | 說明 | 必要 |
|------|------|------|
| `system_prompt` | 定義 AI 的角色與可用工具 | 必填 |
| `model` | 使用的模型，預設 `claude-haiku-4-5` | 選填 |
| `input` | 傳給 AI 的用戶訊息，預設讀 context.message | 選填 |

### 範例：收到 Telegram 訊息，AI 決定下一步

```bash
curl -X POST https://workflow.finally.click/cypher/execute \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "triplets": [
      "start >> 完成後 >> ai-agent",
      "ai-agent >> 查詢匯率 >> get-exchange-rate",
      "ai-agent >> 傳送通知 >> telegram",
      "get-exchange-rate >> 完成後 >> done",
      "telegram >> 完成後 >> done"
    ],
    "context": {
      "message": "現在美元匯率多少？",
      "system_prompt": "你是匯率助理。根據用戶訊息決定呼叫哪個工具：查詢匯率（get-exchange-rate）或傳送通知（telegram）。",
      "model": "claude-haiku-4-5"
    }
  }'
```

AI 讀完 `message`，判斷用戶想查匯率，自動走 `查詢匯率` 這條邊，呼叫 `get-exchange-rate`。

### AI 編譯模式：讓工作流成為 AI 的程式庫

`ai-agent` 有兩種使用模式：

| 模式 | 行為 | 適用場景 |
|------|------|---------|
| **即時模式** | 每次執行時 AI 即時決策 | 用戶對話、不確定輸入 |
| **編譯模式** | AI 設計好工作流後存起來，之後跳過 AI 直接執行 | 重複任務、定時自動化 |

**編譯模式的流程：**

```
第一次：用戶說「幫我每天早上寄美元匯率給我」
  → ai-agent 解析意圖
  → ai-agent 設計 triplets（get-exchange-rate → gmail）
  → 存成工作流 "daily-rate-email"
  → 執行

之後每天 9:00：
  → 直接呼叫 "daily-rate-email"
  → 跳過 ai-agent，機械式執行
  → 不消耗 AI token，速度快，結果穩定
```

這就是「工作流是 AI 的已編譯程式」——AI 只需要思考一次，之後的執行是機械式的，效率最高。

---

## 搜尋零件 {#search}

u6u 是 **AI 友善（AI-friendly）**的系統。你用意圖文字（例如「通知我」）寫三元組，`/cypher/search` 會語義搜尋後**回傳精確的零件 ID**（例如 `telegram`）。這就像你對捷運說「我要去信義區」，系統告訴你「搭板南線到市政府站」——它幫你把意圖轉換成精確的站名。

工作流一旦確認可用，請**儲存系統回傳的精確 ID**，往後執行用精確 ID，不再重新語義搜尋。這樣每次執行結果一致，對企業系統來說是必要的穩定性保證。

```
設計階段（AI 參與）：「通知我」→ 語義搜尋 → 返回 componentId: "telegram"
執行階段（機械式）：直接用 "telegram"，不再語義搜尋，每次結果相同
```

繼續用匯率通知的例子：我想抓匯率 API，先看有沒有現成的零件。

**語義搜尋：**

```bash
curl "https://registry.finally.click/components/search?query=取得匯率"
```

**查詢整個工作流需要哪些零件：**

把整條工作流用三元組描述——每條三元組就是一句清晰的意圖說明，這是給系統看的最清晰的提示詞。系統幫你找哪些現成可用、哪些還缺：

```bash
curl -X POST https://workflow.finally.click/cypher/search \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "triplets": [
      "start >> 完成後 >> 取得匯率",
      "取得匯率 >> 完成後 >> 比較變動",
      "比較變動 >> 條件滿足時 >> 發送通知",
      "發送通知 >> 完成後 >> done"
    ]
  }'
```

回傳：

```json
{
  "nodes": [
    { "id": "filter", "name": "條件過濾", "status": "available" }
  ],
  "missing": ["取得匯率", "比較變動", "發送通知"]
}
```

`nodes` 是找到的零件（系統把你的意圖對應到精確的零件 ID），`missing` 是還沒有的，需要自己建。接下來就建一個。

---

## 發布自己的零件 {#publish}

### 零件是什麼

零件就是一個公開可達的 HTTPS endpoint，u6u 在對的時機呼叫它。就像一個捷運站——你定義它的位置（URL）、進站規格（input）、出站規格（output），u6u 負責在正確時機讓乘客（資料）進出。

兩種常見情境：

1. **呼叫外部 API**：你的 endpoint 打某個服務（例如匯率 API），把結果整理成 u6u 看得懂的格式回傳
2. **Trigger 型**：你的 endpoint 被外部事件呼叫（例如被 GitHub Webhook 觸發），啟動後續工作流

### 規格

- 接受 `POST`，body 是 JSON（工作流傳入的 context）
- 回傳 JSON（會合併進 context 供下游用）
- 失敗時回傳 HTTP 4xx/5xx，**不要回傳 `{ "success": false }` 的 200**

### 範例：取得匯率零件

```js
export default {
  async fetch(request) {
    const context = await request.json();
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    return Response.json({ rate: data.rates[context.currency ?? 'TWD'] });
  }
};
```

這個零件從 context 讀取 `currency`，呼叫公開的匯率 API，回傳 `{ rate: 數字 }`。

### 發布時附上 Gherkin

發布零件時必須附上 Gherkin，說明這個零件的行為預期。AI 可以幫你寫——把你的零件說明丟給 AI，請它產出 Gherkin 格式即可。我們靠 Gherkin 審核意圖，不需要人工看代碼。Gherkin 語法說明可參考 [cucumber.io/docs/gherkin](https://cucumber.io/docs/gherkin/reference/)：

```gherkin
Feature: 取得美元匯率
  Scenario: 成功取得台幣匯率
    Given context 包含 currency = "TWD"
    When 零件被呼叫
    Then 回傳 { "rate": <number> }
    And rate 應該介於 20 到 40 之間

  Scenario: 缺少 currency 參數
    Given context 不含 currency
    When 零件被呼叫
    Then 預設使用 TWD，正常回傳
```

### 發布指令

```bash
curl -X POST https://registry.finally.click/components/publish \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "name": "get-exchange-rate",
    "url": "https://你的worker.workers.dev/rate",
    "method": "POST",
    "description": "取得指定貨幣對美元的即時匯率",
    "input_schema": {
      "properties": {
        "currency": { "type": "string", "description": "目標貨幣代碼，例如 TWD" }
      }
    },
    "output_schema": {
      "properties": {
        "rate": { "type": "number" }
      }
    },
    "gherkin": "Feature: 取得美元匯率\n  Scenario: 成功取得台幣匯率\n    Given context 包含 currency = \"TWD\"\n    When 零件被呼叫\n    Then 回傳 { \"rate\": <number> }"
  }'
```

`description` 寫清楚，影響語義搜尋準確度。

---

## Webhook：讓外部事件觸發工作流 {#webhook}

繼續用匯率通知的例子：除了手動執行，也可以設定外部事件觸發，或定時自動跑。

Webhook 是 u6u 提供的標準觸發機制——你把工作流註冊成一個 Webhook，得到一個公開 URL，任何服務都可以打這個 URL 來啟動你的工作流。

### 把工作流註冊成 Webhook

```bash
curl -X POST https://workflow.finally.click/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "name": "rate-monitor",
    "triplets": [
      "start >> 完成後 >> get-exchange-rate",
      "get-exchange-rate >> 完成後 >> filter",
      "filter >> 條件滿足時 >> http-request",
      "http-request >> 完成後 >> done"
    ],
    "context": { "currency": "TWD" }
  }'
```

回傳：

```json
{
  "webhook_id": "wh_xxxxxxxxxx",
  "webhook_url": "https://workflow.finally.click/webhooks/wh_xxxxxxxxxx/trigger"
}
```

把 `webhook_url` 貼到任何支援 Webhook 的服務（GitHub、Stripe、LINE...），事件發生時自動觸發這個工作流。

### 定時觸發（Cron）

用 `schedule` 欄位設定定時規則，格式是標準 cron 語法（不熟悉可以用 [crontab.guru](https://crontab.guru/) 查詢，也可以直接描述需求請 AI 幫你寫）：

```bash
curl -X POST https://workflow.finally.click/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "name": "hourly-rate-check",
    "triplets": [
      "start >> 完成後 >> get-exchange-rate",
      "get-exchange-rate >> 完成後 >> filter",
      "filter >> 條件滿足時 >> telegram",
      "telegram >> 完成後 >> done"
    ],
    "context": { "currency": "TWD" },
    "schedule": "0 * * * *"
  }'
```

這個設定每小時整點自動執行一次。

---

## 完整範例：定時抓匯率，有變動才記錄 {#full-example}

從頭到尾走完整個流程。全程只用公開 API，不需要任何帳號或認證。

**目標**：每小時抓一次美元兌台幣匯率，如果超過 32.5 就呼叫一個 endpoint 記錄下來（這裡用 httpbin.org 代替你自己的 API）。

---

**步驟一：查詢工作流需要哪些零件**

```bash
curl -X POST https://workflow.finally.click/cypher/search \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "triplets": [
      "start >> 完成後 >> get-exchange-rate",
      "get-exchange-rate >> 完成後 >> filter",
      "filter >> 條件滿足時 >> http-request",
      "http-request >> 完成後 >> done"
    ]
  }'
```

`filter` 和 `http-request` 是內建零件，`get-exchange-rate` 還沒有，進入步驟二。

---

**步驟二：建立取得匯率的 endpoint**

建立一個接受 POST 的公開 HTTPS endpoint，呼叫免費的公開匯率 API：

```js
export default {
  async fetch(request) {
    const context = await request.json();
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    return Response.json({ rate: data.rates[context.currency ?? 'TWD'] });
  }
};
```

部署後取得公開 URL，例如 `https://my-rate-worker.example.workers.dev`。

---

**步驟三：發布零件（附 Gherkin）**

```bash
curl -X POST https://registry.finally.click/components/publish \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "name": "get-exchange-rate",
    "url": "https://my-rate-worker.example.workers.dev",
    "method": "POST",
    "description": "取得指定貨幣對美元的即時匯率，預設使用 TWD",
    "input_schema": {
      "properties": {
        "currency": { "type": "string", "description": "目標貨幣代碼，例如 TWD" }
      }
    },
    "output_schema": {
      "properties": {
        "rate": { "type": "number" }
      }
    },
    "gherkin": "Feature: 取得美元匯率\n  Scenario: 成功取得台幣匯率\n    Given context 包含 currency = \"TWD\"\n    When 零件被呼叫\n    Then 回傳 { \"rate\": <number> }\n    And rate 介於 20 到 40 之間"
  }'
```

---

**步驟四：確認零件已上架**

```bash
curl "https://registry.finally.click/components/search?query=get-exchange-rate"
```

確認回傳結果中有這個零件，status 是 `available`。

---

**步驟五：直接執行測試**

```bash
curl -X POST https://workflow.finally.click/cypher/execute \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "triplets": [
      "start >> 完成後 >> get-exchange-rate",
      "get-exchange-rate >> 完成後 >> filter",
      "filter >> 條件滿足時 >> http-request",
      "http-request >> 完成後 >> done"
    ],
    "context": {
      "currency": "TWD",
      "filter_condition": "rate > 32.5",
      "url": "https://httpbin.org/post",
      "method": "POST",
      "body": { "message": "匯率超過 32.5" }
    }
  }'
```

匯率超過 32.5 時，你會看到 httpbin 的回傳，代表「記錄」步驟被執行了。不符條件時工作流在 `filter` 停止，`http-request` 不會被呼叫。

---

**步驟六：改成定時觸發**

測試通過後，改成每小時自動執行：

```bash
curl -X POST https://workflow.finally.click/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx" \
  -d '{
    "name": "hourly-rate-check",
    "triplets": [
      "start >> 完成後 >> get-exchange-rate",
      "get-exchange-rate >> 完成後 >> filter",
      "filter >> 條件滿足時 >> http-request",
      "http-request >> 完成後 >> done"
    ],
    "context": {
      "currency": "TWD",
      "filter_condition": "rate > 32.5",
      "url": "https://httpbin.org/post",
      "method": "POST",
      "body": { "message": "匯率超過 32.5" }
    },
    "schedule": "0 * * * *"
  }'
```

---

**步驟七：確認定時任務在跑**

```bash
curl https://workflow.finally.click/webhooks \
  -H "X-Api-Key: u6u_xxxxxxxxxxxxxxxx"
```

確認 `hourly-rate-check` 在清單中，狀態是 `active`。

> 之後想換成真正的通知（Telegram、LINE、Gmail），只需要把 `http-request` 換成對應的零件，加上 credential 即可。工作流其餘部分不需要改。

---

## 📚 互動式 API 文檔

**Swagger UI 網頁版**（推薦用於測試和學習）：

[https://workflow.finally.click/docs](https://workflow.finally.click/docs)

點開即可在網頁上測試所有端點，無須命令列。

**OpenAPI 3.1 Spec**（給 IDE 和工具使用）：

[https://workflow.finally.click/openapi.json](https://workflow.finally.click/openapi.json)

---

### 推薦使用流程

#### 方法 A：直接執行（最簡單，無需先搜尋）

適合：已知道要用什麼零件，直接跑

```bash
curl -X POST https://workflow.finally.click/cypher/execute \
  -H "Content-Type: application/json" \
  -H "X-Partner-Key: your-key-here" \
  -d '{
    "triplets": [
      "start >> 完成後 >> http-request",
      "http-request >> 完成後 >> done"
    ],
    "context": {
      "url": "https://api.example.com/data",
      "method": "GET"
    }
  }'
```

#### 方法 B：先搜尋再執行（推薦，知道零件名稱就 OK）

適合：不確定零件是否存在，先查詢

```bash
# 第一步：搜尋零件
curl -X POST https://workflow.finally.click/cypher/search \
  -H "Content-Type: application/json" \
  -d '{
    "triplets": [
      "start >> 完成後 >> http-request",
      "http-request >> 完成後 >> done"
    ]
  }'
# 確認所有零件都 found

# 第二步：直接執行
curl -X POST https://workflow.finally.click/cypher/execute \
  -H "Content-Type: application/json" \
  -H "X-Partner-Key: your-key-here" \
  -d '{
    "triplets": [
      "start >> 完成後 >> http-request",
      "http-request >> 完成後 >> done"
    ],
    "context": {
      "url": "https://api.example.com/data",
      "method": "GET"
    }
  }'
```

#### 方法 C：用 Webhook 讓外部事件觸發（無需經常呼叫）

適合：GitHub / Stripe / 定時任務需要觸發工作流

```bash
# 建立 Webhook
curl -X POST https://workflow.finally.click/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Partner-Key: your-key-here" \
  -d '{
    "triplets": [
      "start >> 完成後 >> process",
      "process >> 完成後 >> done"
    ],
    "description": "GitHub webhook processor"
  }'

# 回傳
# {
#   "token": "abc123...",
#   "webhook_url": "https://workflow.finally.click/webhooks/abc123.../trigger"
# }

# 把 webhook_url 貼到 GitHub → 事件觸發自動執行
```

---

### 常見問題

**Q: 為什麼三元組格式是「FROM >> ACTION >> TO」，不能更短？**
A: 每條三元組代表一個執行步驟，必須有三部分：源、動作、目標。如果只寫「start >> done」會被視為語法錯誤。

**Q: triplets 和 graph 格式有什麼差別？**
A: `triplets` 是文字描述（推薦），`graph` 是結構化 JSON（給 UI 工具用）。優先用 triplets。

**Q: 如何測試 API？**
A: 用 `https://workflow.finally.click/docs` 的 Swagger UI，無須命令列。

---

*最後更新：2026-04-02 OpenAPI 文檔上線，所有端點可測試*

<!-- TODO for Danni:
1. 部署 u6u-builtins Worker（目前 404），部署後執行 POST /init 把內建零件上架到 Registry Vectorize
   → 這樣「通知我」才能語義搜尋到 telegram/gmail/line-notify
2. 部署 u6u-credentials Worker（目前 404）
3. 確認 /cypher/search 在 u6u-builtins 上架後，「通知我」可以語義對應到 telegram
4. 長串 triplet（超過一個 >> 對）目前無法解析，parseTriplets 只接受三段，文件已修正，確認工程也不需要支援長串
5. [架構設計] credential 需要 OAuth 交換流程：
   - 目前 u6u-credentials 只能存已取得的 access_token（假設用戶自己去取）
   - 需要補：Google OAuth callback、LINE OAuth callback → 自動存入 KV
   - 這是 PWA 的核心功能：用戶點「連結 Google 帳號」→ OAuth 流程 → credential 自動建立
6. [架構設計] 視覺化明示原則（參考 Android 背景服務通知）：
   - 每個 credential 要顯示連線狀態（連線中 / 已過期 / 已撤銷），可手動撤銷
   - 每個工作流要顯示運行狀態（執行中 / 暫停 / 上次執行時間）
   - 用戶必須能看到「什麼東西還在跑」，並主動關閉
   - 不允許背景靜默執行卻沒有任何視覺狀態
-->
