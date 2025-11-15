# Prompt Optimizer for Vibecoding

**本项目完全由 ChatGPT-5.1-thinking 完成**

一个基于 **React + Vite（前端）** 与 **Node.js + Express（后端）** 的小工具，
用于将自然语言描述的编程任务信息，转化为结构化、高质量、适用于 vibecoding 的 Markdown Prompt（内部包含 JSON 片段）。

## 目录结构

- `client/`：前端 React 项目（Vite）
  - `src/App.jsx`：主界面，包含六大信息板块与参数调节
  - `src/main.jsx`、`src/index.css`：入口与样式
- `server/`：后端 Node + Express
  - `server.js`：调用 DeepSeek API 的服务端路由
  - `.env.example`：环境变量模板（请复制为 `.env` 使用）

## 使用步骤

### 1. 启动后端

```bash
cd server
cp .env.example .env
# 编辑 .env，把 DEEPSEEK_API_KEY 改成你自己的 DeepSeek Key
npm install
npm start
```

后端默认监听：`http://localhost:3000`。

### 2. 启动前端（Vite）

```bash
cd client
npm install
npm run dev
```

Vite 默认端口通常是 `http://localhost:5173`。

此时在浏览器访问 `http://localhost:5173` 即可看到界面。

### 3. 使用说明

1. 左侧依次填写：
   - 任务信息（任务目标、预期质量、输出形式）
   - 上下文信息（项目背景、技术栈版本、运行环境、必须遵守的约束、当前问题与瓶颈）
   - 输入内容（代码片段、数据结构、API 返回、UI 描述）
   - 输出规范（输出形式要求、注释要求、是否需要测试）
   - 风格与限制（第三方库政策、代码风格、命名习惯、禁止修改部分）
   - 示例参考（你喜欢的 Prompt 或项目风格）
2. 顶部可以选择 `deepseek-chat` 或 `deepseek-reasoner`，并调整 `temperature`、`top_p`、`max_tokens`。
3. 点击「生成优化 Prompt」后，右侧会展示 DeepSeek 生成的 Markdown Prompt，其中包含一个整理好的 JSON 代码块以及后续指令段落。
4. 点击右上角的「复制 Prompt」即可一键复制，在其它模型（如代码助手、ChatGPT、Claude 等）中直接使用。

---
