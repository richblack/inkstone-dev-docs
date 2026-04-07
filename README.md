# 💎 u6u Developer Kit (u6u 開發者套件)

歡迎來到 **u6u** —— 全球首個 **AI 優先 (AI-First)** 的工作流自動化平台。

u6u 讓開發者不再需要手寫複雜的膠水代碼 (Glue Code)。透過 **語義三元組 (Triplets)** 與 **Cypher 執行圖**，你可以直接描述 AI 的意圖，系統會自動在 Matrix 基礎設施中尋找、組裝並執行對應的零件。

---

## 🚀 快速跳轉

- [📖 開發者完整指南](./GUIDE.md) — 了解核心概念與進階用法
- [⚡ 互動式 API 文檔 (Swagger)](https://workflow.finally.click/docs) — **直接在瀏覽器玩玩看！**
- [🔑 取得 API Key](https://admin.finally.click/partner-keys) — 申請進入 Matrix 宇宙的通行證

---

## 🧠 核心概念：三元組執行 (Triplet Execution)

在 u6u 中，一個工作流就是一組簡單的描述。例如：

```text
"HTTP Request >> 完成後 >> JSON Parser >> 成功時 >> Slack Notifier"
```

AI 會理解這些語義，自動幫你處理資料流與狀態轉移。

### 快速測試 (Quick Start)

如果你已經拿到 `Partner Key`，可以用以下指令測試執行：

```bash
curl -X POST "https://workflow.finally.click/cypher/execute" \
  -H "Authorization: Bearer YOUR_PARTNER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "triplets": ["input >> 完成後 >> hello-world"],
    "context": { "name": "Developer" }
  }'
```

---

## 🛠 開發者工具箱

### 1. 零件倉庫 (Component Registry)
你可以定義自己的「原子能力」(Components)，並發佈到 Registry 中供 AI 調用。
- [瀏覽所有可用零件](https://workflow.finally.click/docs#/Components/get_components)

### 2. 執行引擎 (Cypher Executor)
負責解析語義圖並確保每個節點在安全沙箱中正確運行。
- [執行引擎介面](https://workflow.finally.click/docs#/Cypher%20Executor)

### 3. 認證系統 (Credentials)
安全地儲存你的第三方 API Keys，並在執行時動態注入。
- [認證管理介面](https://workflow.finally.click/docs#/Credentials)

---

## 📂 相關專案

- [inkstone-mini-me-pwa](https://github.com/richblack/inkstone-mini-me-pwa) — 面向用戶的 finally.click 社交入口
- [inkstone-admin](https://github.com/richblack/inkstone-admin) — 管理後台與 API Key 簽發中心
- [u6u-studio](https://github.com/richblack/u6u-studio) — 視覺化工作流編輯器

---

## 🤝 貢獻與反饋

如果你在開發過程中遇到任何問題，或有新的零件構想：
1. 查閱 [GUIDE.md](./GUIDE.md)
2. 透過 [finally.click](https://finally.click) 聯繫我們。

---
© 2026 **InkStone Co.** | *Building AI-First Infrastructure.*
