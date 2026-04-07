# 💎 u6u Developer Kit (u6u 開發者套件)

歡迎來到 **u6u** —— **AI 優先 (AI-First)** 的工作流自動化平台。

u6u 是反過來的 n8n！

n8n 的強項是它機械般的穩定彌補 AI 的不確定。所有重要流程，例如匯款、機械、航太，都要求 100% 正確。

But 為了達成機械穩定，n8n 也犧牲很多便利，用過的人會感同身受：

- 觀念困難：像寫程式一樣強大，但建構工作流也像寫程式一樣難，沒程式基礎不易學。
- AI 不友善：龐大複雜 json 語法，AI 生成錯一點就壞掉，很少能一次成功，浪費 Token。
- 執行緩慢：架構沉重，很吃資源，導致運行遲緩。
- 設定繁雜：節點設定項多，難以掌握。
- 環境封閉：Self-hosted 才能裝社群節點，雖已整合大量服務，但還是趕不上新服務問世速度，可用 http request，對非技術人員很困難。

> n8n 是當前最好的工作流軟體，這些問題別家更嚴重。

跟 n8n 從手寫程式開始相反，u6u 是 AI 優先，就是跟 AI 描述你的意圖，自動幫你完成，但它一樣做出機械化的穩定工作流，但簡化到幾乎不用學。

- 觀念簡單：背後是完整的程式，但跟 AI 描述不用寫，不會程式也 OK。
- AI 友善：AI 寫簡單的「三元組」語法，比 Python 還容易，不出錯省 Token。
- 執行快速：V8 Isolates 邊緣運算技術，程式啓動高達 0~5 毫秒，比一般網頁還快。
- 設定簡單：AI 幫你，不用設定。
- 環境開放：不像 n8n 要針對每個服務開發「節點」，u6u 的「零件」讓 AI 可以立刻造，以後還能用，免安裝。

---

## 🚀 快速跳轉

- [📖 進階開發指南](./GUIDE.md) — 了解核心概念與三元組用法
- [⚡ 互動式 API 文檔 (Swagger)](https://dev.finally.click/) — **直接在瀏覽器玩玩看！**
- [🔑 取得 API Key](https://admin.finally.click/) — 申請進入 Matrix 宇宙的通行證 (需登入管理後台)

---

## 核心概念

### 提示詞優先

當你跟 AI 說你的意圖：「去抓銀行網站匯率，再用 Telegram 通知我」。

AI 通常會寫 Python 程式達成。但下次抓匯率又寫一次，這不是很浪費 Token 嗎？

其實只有第一次需要 AI 寫，以後可以自動執行。但為了執行程式，你要租個伺服器、把程式丟到雲端、Debug，真麻煩。

用 u6u 時，AI 不寫複雜的 Python 程式，而是用 u6u 寫簡單的工作流「描述」，然後就可以重複使用，不需每天叫 AI 寫浪費錢，而 Line 可以每天收到新匯率。

> 因 AI First，u6u 的首選界面是 MCP Server，你可想像它是 AI 工具箱，它看到就會用

### 三元組執行 (Triplet Execution)

u6u 中一切都是「三元組」，工作流就是一組簡單描述。

#### 你下命令

你跟 AI 說：「去抓銀行網站匯率，再用 Telegram 通知我」。

#### AI 理解

AI 聽懂了說「我分解成 3 個動作」：

1. 去網站抓資料 ☞ HTTP Request
2. 把資料整理好 ☞ JSON Parser
3. 傳送給 Line ☞ Telegram Notifier

AI 把這個流程用「三元組」格式寫，像下面這樣：

```text
HTTP Request >> 完成後 >> JSON Parser,
JSON Parser >> 成功時 >> Telegram Notifier
```
這裡有 2 個三元組，寫法是「A 零件 >> 關係 >> B 零件」，第一個的尾巴和第二個開頭都是「JSON Parser」，它們就組合成下面這樣類似 n8n 的工作流：
```text
HTTP Request >> 完成後 >> JSON Parser >> 成功時 >> Telegram Notifier
```
因為語法這麼簡單，你我都可以一眼看懂，AI 當然不會出錯。

> AI 擅長理解意圖，三元組擅長表達意圖，用來從你的 AI 傳達意圖到 u6u

#### AI 查詢

AI 用三元組「意圖」問 u6u，查看零件庫後回覆：

```text
HTTP Request 編號 abc-123-444 ✅ 有此零件
JSON Parser 編號 abc-123-555 ✅ 有此零件
Telegram Notifier，開發編號 ID abc-123-666 ❌ 無此零件
```

缺零件怎麼辦？別擔心，u6u 零件開發非常簡單。

AI 速讀開發格式，當場做了「Telegram Notifier」零件，測試通過立刻回覆 AI。

> 零件只是模板，AI 只填表不易出錯，不需像 n8n 嚴謹的開發流程，但同樣安全。

#### AI 執行

AI 再搜一次意圖，u6u 回覆：

```text
HTTP Request 編號 abc-123-444 ✅ 有此零件
JSON Parser 編號 abc-123-555 ✅ 有此零件
Telegram Notifier 編號 abc-123-456 ✅ 有此零件
```
成了，工作流運行一次！你會發現非常快，因為不像別的軟體要啓動複雜的機械流程，u6u 背後的機制極度輕量，執行速度是傳統的數十倍。

#### 儲存工作流或自己執行

如果滿意結果，就儲存工作流，下次自己按一下就能取得匯率。也可設定在固定時間自動執行。

這個工作流執行時不需要 AI，你可以把你的 Token（錢）用在更值得的地方。

---

### 快速測試 (Quick Start)

如果你已經拿到 `API Key`，可以用以下指令測試執行：

```bash
curl -X POST "https://workflow.finally.click/cypher/execute" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "triplets": ["input >> 完成後 >> hello-world"],
    "context": { "name": "Developer" }
  }'
```

---

## 🤖 AI 優先：MCP Server 設置 (Model Context Protocol)

u6u 不僅是為人類設計的，更是為 **AI 代理 (AI Agents)** 原生設計的。
我們提供標準的 **Model Context Protocol (MCP)** 伺服器，讓 Claude.ai、Cursor 或任何支援 MCP 的工具能直接具備「建立」與「管理」工作流的能力。

### 1. Claude Desktop 配置
在 `~/Library/Application Support/Claude/claude_desktop_config.json` 加入：

```json
{
  "mcpServers": {
    "u6u": {
      "command": "npx",
      "args": ["-y", "@u6u/mcp-server"],
      "env": {
        "U6U_API_KEY": "你的_API_KEY"
      }
    }
  }
}
```

> **注意**：如果你正在開發中，可以使用 SSE URL：`https://dev.finally.click/sse`

### 2. Cursor 配置
在 `Cursor Settings > MCP` 中新增：
- **Name**: `u6u`
- **Type**: `sse`
- **Value**: `https://dev.finally.click/sse` (Headers: `X-Api-Key: YOUR_API_KEY`)

### 3. AI 具備的超能力 (Tools)

當你連接上 u6u MCP 後，AI 將獲得以下核心工具：

- **`u6u_search_components`**：AI 會將你的自然語言需求拆解為三元組 (Triplets)，並自動搜尋現有的零件庫。
- **`u6u_execute_workflow`**：AI 可以在沙盒環境中即時測試它設計的工作流。
- **`u6u_deploy_workflow`**：當測試通過，AI 可以幫你正式發佈工作流，並設定 Webhook 或 Cron 排程。
- **`u6u_publish_component`**：如果發現缺件，AI 可以直接撰寫代碼或 Gherkin 劇本並發佈一個新的零件。

### 📖 動態工具文檔 (Live Docs)
為了確保開發者與 AI 看到的工具定義始終同步，我們提供以下自動生成的端點：

- **MCP 工具目錄 (JSON)**: [https://dev.finally.click/tools/catalog](https://dev.finally.click/tools/catalog) — *回傳最新工具規格，供 AI 讀取。*
- **互動式測試界面 (Cloudflare)**: [透過 Cloudflare MCP Inspector 即時測試](https://mcp-inspector.pages.dev/?url=https://dev.finally.click/sse&transport=sse) — *官方推薦的互動式測試工具。*

---

## 🛠 開發者工具箱

### 1. 零件倉庫 (Component Registry)
你可以定義自己的「原子能力」(Components)，並發佈到 Registry 中供 AI 調用。
- [瀏覽所有可用零件](https://dev.finally.click/)

### 2. 執行引擎 (Cypher Executor)
負責解析語義圖並確保每個節點在安全沙箱中正確運行。
- [執行引擎介面](https://dev.finally.click/)

### 3. 認證系統 (Credentials)
> ⚠️ **開發中**：目前採手動發放 API Key 模式，認證管理界面僅供內部 (Admin) 使用，暫不對外開放。

---

### 4. 進階開發指南
如果你是工程師，想了解三元組 (Triplet) 語法、如何自建零件或使用 Markdown 進行開發：
- 請參閱 [GUIDE.md](./GUIDE.md)

---

## 📂 相關專案

- [u6u-studio](https://github.com/richblack/u6u-studio) — 視覺化工作流編輯器
> 開發中請稍待
---

## 🤝 貢獻與反饋

如果你在開發過程中遇到任何問題，或有新的零件構想：
1. 透過 [finally.click](https://finally.click) 聯繫我們。
2. 參考 [GUIDE.md](./GUIDE.md) (進階開發指南)

---
© 2026 **InkStone Co.** | *Building AI-First Infrastructure.*
