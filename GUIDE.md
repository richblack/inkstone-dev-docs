# u6u 開發者指南 (Advanced Guide) {#top}

u6u 是 **AI 優先（AI-first）**的工作流平台。對於工程師而言，u6u 提供了一套基於「圖形語義」的開發範式，讓你可以透過 Markdown、三元組 (Triplets) 與 API 直接建構自動化流程。

---

## 🛠️ 核心開發概念

### 1. 三元組執行 (Triplet Execution)

u6u 的設計哲學是「圖形即語義」。工作流不是一堆複雜的 JSON，而是由一組簡單的語意描述組成。

#### 三元組格式
`節點A >> 關係描述 >> 節點B`

- **源節點 (Source)**：觸發點或上游數據產出者。
- **關係描述 (Relation)**：描述「為什麼」跳到下一步。常用的有：`完成後`、`成功時`、`失敗時`、`條件滿足時`。
- **目標節點 (Target)**：下一步執行的動作。

> **重要規則**：一條三元組字串僅能包含一個 `>>` 對。例如：
> - ✅ `start >> 完成後 >> http-request`
> - ❌ `start >> 完成後 >> http-request >> 完成後 >> done` (請拆分為兩條)

### 2. 圖形即語義 (Visual Semantics)

u6u 採用 UML 活動圖的圖形語義。在視覺化界面中，圖形本身代表了執行邏輯。

| 圖形 | 名稱 | u6u 對應零件 | 語義 |
|------|------|------------|------|
| ● | 實心圓 | `start` | 起點，初始化數據內容 (Context) |
| ◎ | 雙環圓 | `done` | 終點，工作流執行結束 |
| ▭ | 圓角矩形 | 一般零件 | 執行具體動作（如 API 呼叫） |
| ◇ | 菱形 | `filter`、`switch` | 決策點，依條件分岔 |
| ▬ | 水平粗條 | `merge` | 同步點，等待所有並行分支完成 |
| 🤖 | Agent 圖示 | `ai-agent` | AI 決策中樞，動態路由 |

---

## 🚀 快速開始

### 第一步：查詢現有零件
無需認證即可查看目前註冊的所有原子能力。

```bash
curl https://registry.finally.click/components
```

### 第二步：執行工作流
使用 `X-Api-Key` 進行身份驗證並執行一個簡單的 Triplet 鏈。

```bash
curl -X POST https://workflow.finally.click/cypher/execute \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: YOUR_API_KEY" \
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

---

## 🏗️ 本地開發流程 (Workflow as Code)

u6u 鼓勵工程師使用 Git 進行工作流的版本管理。

1. **建立文檔**：在專案中建立 `workflows/my-task.md`。
2. **迭代設計**：在 Markdown 中定義意圖、步驟與三元組。
3. **雲端驗證**：
   - 使用 `/cypher/search` 檢查零件完整性。
   - 使用 `/cypher/execute` 進行沙盒測試。
4. **提交 commit**：將通過測試的工作流定義提交至倉庫。

---

## 🧩 零件建立 (Component Creation)

當內建零件無法滿足需求時，你可以快速發佈自定義零件。

### 發佈流程

```bash
curl -X POST https://registry.finally.click/components/publish \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-custom-fetcher",
    "url": "https://your-service.workers.dev/api",
    "method": "POST",
    "description": "描述零件的功能，AI 會根據此描述進行語意匹配",
    "gherkin": "Feature: 取得特定數據\n  Scenario: 成功取得..."
  }'
```

### 實作規格
- 零件必須是一個公開的 HTTPS Endpoint。
- 接收 `POST` 請求，Body 為當前工作流的 `context` JSON。
- 必須回傳 `200 OK` 且為 JSON 格式，結果將被合併回工作流 context。

---

## 📚 互動式 API 文檔

- **Swagger UI**: [https://workflow.finally.click/docs](https://workflow.finally.click/docs)
- **OpenAPI Spec**: [https://workflow.finally.click/openapi.json](https://workflow.finally.click/openapi.json)

---
© 2026 **InkStone Co.** | *Engineer-First Workflow Infrastructure.*
