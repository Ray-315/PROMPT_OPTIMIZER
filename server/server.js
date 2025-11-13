import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

// 本地开发允许来自 Vite 前端的跨域请求（上线时改成你的正式域名）
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// 使用 OpenAI SDK 调用 DeepSeek API
const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

/**
 * 根据前端传来的 rawInfo 构造 messages
 * 让 DeepSeek 帮忙把这些信息整理成高质量的 Prompt。
 */
function buildMessages(rawInfo) {
  return [
    {
      role: "system",
      content:
        "你是一名资深 Prompt Engineer，擅长将杂乱的自然语言需求整理成结构化、可复用、适合编程场景的高质量 Markdown Prompt，并在其中嵌入 JSON 结构。",
    },
    {
      role: "user",
      content: `
请根据下面关于一次编程 / 开发任务的原始信息，生成一段**面向大语言模型 / 代码助手的最终 Prompt**。

【输出要求】：
1. 整体使用 **Markdown** 语法编写。
2. 开头用 2～4 句话自然语言，总结任务目标和模型角色。
3. 之后给出一个 \`\`\`json 代码块，键名固定为：
   - "task_info"
   - "context_info"
   - "input_content"
   - "output_spec"
   - "style_constraints"
   - "examples"
   这些键的值请是你已经**整理、去重、补全后的内容**，不要原封不动地照抄。
4. JSON 后，可以继续用 Markdown 小标题（如“## 交互规则”“## 回答风格”等），以条目形式写出对下游模型的明确指令。
5. 尽量消除歧义，把隐含条件改写为显式规则；如果信息缺失，可给出合理默认约定。
6. 保持工程师友好的风格：简洁但不遗漏关键约束；命令语气清晰易执行。

【原始信息（前端表单整理后的 JSON）】：
\`\`\`json
${JSON.stringify(rawInfo, null, 2)}
\`\`\`
      `,
    },
  ];
}

// ===== 路由：接收前端请求，调用 DeepSeek 生成优化后的 Prompt =====
app.post("/api/prompt-optimize", async (req, res) => {
  try {
    const { model, temperature, top_p, max_tokens, rawInfo } = req.body;

    if (!rawInfo) {
      return res.status(400).json({ error: "缺少 rawInfo 字段" });
    }

    const messages = buildMessages(rawInfo);

    // 调用 DeepSeek Chat Completions
    const response = await client.chat.completions.create({
      model: model || "deepseek-chat",
      messages,
      temperature: typeof temperature === "number" ? temperature : 0.7,
      top_p: typeof top_p === "number" ? top_p : 0.9,
      max_tokens: typeof max_tokens === "number" ? max_tokens : 2048,
      stream: false,
    });

    const content = response.choices?.[0]?.message?.content || "";

    return res.json({ prompt: content });
  } catch (err) {
    console.error("调用 DeepSeek API 失败：", err);
    return res
      .status(500)
      .json({ error: "DeepSeek API 调用失败", detail: err.message });
  }
});

// 启动服务
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Prompt optimizer server listening on http://localhost:${port}`);
});
