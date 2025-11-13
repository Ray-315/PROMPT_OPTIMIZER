import React, { useState } from "react";




/**
 * 主页面组件：
 * - 左侧：六大板块表单输入
 * - 右侧：优化后的 Prompt（Markdown 文本）
 * - 顶部：模型选择、温度 / top_p / max_tokens 调节
 * - 动画与样式：在 index.css 中定义
 */
const App = () => {


  // ====================== 默认示例内容（自动填充） ======================
  const demoDefaults = {
    task_info: {
      goal: "为 React + TypeScript 项目生成可复用、工程级别的 Prompt。",
      quality_requirements:
        "结构化、可复用、边界条件明确，适合高级工程师直接使用。",
      expected_output_form: "Markdown 文档 + JSON 结构块。",
    },

    context_info: {
      project_background:
        "本项目基于 React 18、TypeScript、Vite，旨在通过组件化方式构建前端系统。",
      tech_stack_versions: "React 18 + TypeScript 5 + Vite 5。",
      runtime_env: "Node.js 18 + 浏览器环境。",
      hard_constraints:
        "组件必须保持不可变性，不允许使用未经批准的第三方库。",
      current_issues: "状态管理复杂、跨组件数据同步困难。",
    },

    input_content: {
      code_snippets: "输入你的代码片段，支持函数、组件、Hook 内容。",
      data_structures: "可传入接口定义、TS 类型结构。",
      api_responses: "支持 JSON 格式的 REST API 返回值。",
      ui_description: "可描述 UI 草图、布局结构或操作流程。",
    },

    output_spec: {
      format_requirements: "要求 markdown 输出、结构清晰。",
      comment_requirements: "代码需要包含详细注释说明。",
      need_test_cases: "如适用，请生成 Jest 单元测试。",
    },

    style_constraints: {
      third_party_libs: "仅可使用项目已允许的库，如 React、Zustand。",
      code_style: "使用 ESLint + Prettier 风格，避免魔法数。",
      naming_conventions: "统一使用 camelCase。",
      forbidden_parts: "禁止直接操作 DOM、禁止修改全局状态。",
    },

    examples: {
      style_reference: "可参考 GitHub 上的 OpenAI Prompt Guide。",
    },
  };


  // ========== 主题状态 ==========
  const [theme, setTheme] = useState("light"); // "dark" | "light"

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // ========== 表单状态：六大板块 ==========
  const [form, setForm] = useState({
    // 任务信息
    taskGoal: "",
    taskQuality: "",
    taskOutputFormat: "",

    // 上下文信息
    contextBackground: "",
    contextTechStack: "",
    contextRuntime: "",
    contextConstraints: "",
    contextPainPoints: "",

    // 输入内容
    inputCode: "",
    inputDataStructures: "",
    inputApiResponse: "",
    inputUiDescription: "",

    // 输出规范
    outputFormatRequirements: "",
    outputCommentRequirements: "",
    outputNeedTests: "auto", // auto / yes / no

    // 风格与限制
    styleThirdPartyLibs: "allowed", // allowed / limited / forbidden
    styleCodeStyle: "",
    styleNaming: "",
    styleForbiddenAreas: "",

    // 示例参考
    exampleReference: "",
  });

  // ========== DeepSeek 调参 ==========
  const [model, setModel] = useState("deepseek-chat");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState("2048");

  // ========== 请求 & 输出状态 ==========
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  // 通用输入处理
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };


  // 3. 做边界裁剪：下限 256，上限 8192
  const clamped = Math.min(8192, Math.max(256, parsed));

  // 4. 返回字符串，方便直接塞回 input 的 value
  return String(clamped);
};

// 自动补全工具：如果用户没输入（为空字符串），使用默认示例
const autoFill = (userValue, defaultValue) => {
  if (!userValue || !userValue.trim()) {
    return defaultValue;
  }
  return userValue.trim();
};


// 提交：调用后端 /api/prompt-optimize
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMsg("");
  setOptimizedPrompt("");
  setCopyStatus("");

  try {
    // 将表单整理成结构化 JSON
    // 在 handleSubmit 里、构造 payload 之前加上：
    const parsedMaxTokens = parseInt(maxTokens || "2048", 10) || 2048;
    // 做一个简单的边界控制：256 ~ 8192
    const safeMaxTokens = Math.min(8192, Math.max(256, parsedMaxTokens));
    // ================== 构建 payload（自动补全空字段） ==================
    const payload = {
      model,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,

      rawInfo: {
        task_info: {
          goal: autoFill(form.taskGoal, demoDefaults.task_info.goal),
          quality_requirements: autoFill(
            form.taskQuality,
            demoDefaults.task_info.quality_requirements
          ),
          expected_output_form: autoFill(
            form.taskOutputFormat,
            demoDefaults.task_info.expected_output_form
          ),
        },

        context_info: {
          project_background: autoFill(
            form.contextBackground,
            demoDefaults.context_info.project_background
          ),
          tech_stack_versions: autoFill(
            form.contextTechStack,
            demoDefaults.context_info.tech_stack_versions
          ),
          runtime_env: autoFill(
            form.contextRuntime,
            demoDefaults.context_info.runtime_env
          ),
          hard_constraints: autoFill(
            form.contextConstraints,
            demoDefaults.context_info.hard_constraints
          ),
          current_issues: autoFill(
            form.contextPainPoints,
            demoDefaults.context_info.current_issues
          ),
        },

        input_content: {
          code_snippets: autoFill(
            form.inputCode,
            demoDefaults.input_content.code_snippets
          ),
          data_structures: autoFill(
            form.inputDataStructures,
            demoDefaults.input_content.data_structures
          ),
          ui_description: autoFill(
            form.inputUiDescription,
            demoDefaults.input_content.ui_description
          ),
        },

        output_spec: {
          format_requirements: autoFill(
            form.outputFormatRequirements,
            demoDefaults.output_spec.format_requirements
          ),
          comment_requirements: autoFill(
            form.outputCommentRequirements,
            demoDefaults.output_spec.comment_requirements
          ),
          need_test_cases: autoFill(
            form.outputNeedTests,
            demoDefaults.output_spec.need_test_cases
          ),
        },

        style_constraints: {
          third_party_libs: autoFill(
            form.styleThirdPartyLibs,
            demoDefaults.style_constraints.third_party_libs
          ),
          code_style: autoFill(
            form.styleCodeStyle,
            demoDefaults.style_constraints.code_style
          ),
          naming_conventions: autoFill(
            form.styleNaming,
            demoDefaults.style_constraints.naming_conventions
          ),
          forbidden_parts: autoFill(
            form.styleForbiddenAreas,
            demoDefaults.style_constraints.forbidden_parts
          ),
        },

        examples: {
          style_reference: autoFill(
            form.exampleReference,
            demoDefaults.examples.style_reference
          ),
        },
      },
    };


    // 注意：开发环境下，前端默认是 5173 端口，后端是 3000 端口
    const res = await fetch("http://localhost:3000/api/prompt-optimize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`服务器返回错误状态码：${res.status}`);
    }

    const data = await res.json();

    if (!data.prompt) {
      throw new Error("后端未返回 prompt 字段，请检查 server 代码。");
    }

    setOptimizedPrompt(data.prompt);
  } catch (err) {
    console.error(err);
    setErrorMsg(err.message || "调用 DeepSeek 失败，请稍后重试。");
  } finally {
    setIsLoading(false);
  }
};

// 一键复制优化后的 Prompt
const handleCopy = async () => {
  if (!optimizedPrompt) return;
  try {
    await navigator.clipboard.writeText(optimizedPrompt);
    setCopyStatus("已复制到剪贴板 ✅");
    setTimeout(() => setCopyStatus(""), 2000);
  } catch (err) {
    console.error(err);
    setCopyStatus("复制失败，请手动选择文本复制。");
    setTimeout(() => setCopyStatus(""), 3000);
  }
};

return (
  <div className={`app-root ${theme === "light" ? "theme-light" : "theme-dark"}`}>
    {/* 背景渐变层 */}
    <div className="app-gradient-bg" />

    {/* 居中主容器 */}
    <div className="app-container">
      {/* 顶部标题与模型参数设置 */}
      <header className="app-header fade-in-up">
        <div className="app-header-left">

          <div className="app-title-block">
            <h1>Prompt Optimizer for Vibecoding</h1>
            <p className="app-subtitle">
              填写你的任务、上下文和约束，让 DeepSeek 帮你生成结构化、Markdown
              友好的高质量 Prompt（含 JSON 片段）。
            </p>
          </div>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "🌙 深色模式" : "☀️ 浅色模式"}
          </button>
        </div>


        <div className="app-header-controls">
          {/* 模型选择 */}
          <div className="field-group">
            <label>模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="deepseek-chat">deepseek-chat</option>
              <option value="deepseek-reasoner">deepseek-reasoner</option>
            </select>
          </div>

          {/* 温度调节 */}
          <div className="field-group slider-group">
            <label>
              温度{" "}
              <span className="slider-value">{temperature.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />
          </div>

          {/* top_p 调节 */}
          <div className="field-group slider-group">
            <label>
              top_p <span className="slider-value">{topP.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
            />
          </div>

          {/* max_tokens 输入 */}
          <div className="field-group small-number">
            <label>max_tokens</label>
            <input
              type="number"
              min="256"
              max="8192"
              value={maxTokens}
              // 输入时只更新字符串，让用户可以自由编辑
              onChange={(e) => setMaxTokens(e.target.value)}
              // 失焦时进行一次规范化并回写到输入框
              onBlur={() => {
                const normalized = normalizeMaxTokens(maxTokens);
                setMaxTokens(normalized);
              }}
            />
          </div>
        </div>
      </header>

      {/* 主体：左右两列 */}
      <main className="app-main">
        {/* 左侧：表单列 */}
        <form className="form-column fade-in-up" onSubmit={handleSubmit}>
          <div className="form-header-row">
            <h2>信息输入</h2>
            <div className="form-header-actions">

              <button
                type="submit"
                className={`primary-btn ${isLoading ? "primary-btn-loading" : ""
                  }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    生成中…
                  </>
                ) : (
                  "生成优化 Prompt"
                )}
              </button>
            </div>
          </div>

          {/* 任务信息 */}
          <section className="card">
            <h3>任务信息</h3>
            <div className="field-group">
              <label>任务目标（越具体越好）</label>
              <textarea
                rows={2}
                placeholder="例如：为 React 项目生成可复用的代码生成 Prompt，用于优化现有组件结构……"
                value={form.taskGoal}
                onChange={handleInputChange("taskGoal")}
                required
              />
            </div>
            <div className="field-group">
              <label>预期质量要求</label>
              <textarea
                rows={2}
                placeholder="例如：需要工程级质量、考虑边界情况、给出错误处理策略……"
                value={form.taskQuality}
                onChange={handleInputChange("taskQuality")}
              />
            </div>
            <div className="field-group">
              <label>最终输出形式</label>
              <input
                type="text"
                placeholder="例如：Markdown 文档 + JSON 结构块"
                value={form.taskOutputFormat}
                onChange={handleInputChange("taskOutputFormat")}
              />
            </div>
          </section>

          {/* 上下文信息 */}
          <section className="card">
            <h3>上下文信息</h3>
            <div className="field-group">
              <label>项目背景</label>
              <textarea
                rows={2}
                placeholder="项目做什么？当前进展如何？"
                value={form.contextBackground}
                onChange={handleInputChange("contextBackground")}
              />
            </div>
            <div className="field-group">
              <label>技术栈版本</label>
              <textarea
                rows={2}
                placeholder="例如：React 18, Vite 5, TypeScript 5, Node 22, Electron 30……"
                value={form.contextTechStack}
                onChange={handleInputChange("contextTechStack")}
              />
            </div>
            <div className="field-group">
              <label>运行环境</label>
              <input
                type="text"
                placeholder="例如：浏览器 / Node / Electron / 移动端等"
                value={form.contextRuntime}
                onChange={handleInputChange("contextRuntime")}
              />
            </div>
            <div className="field-group">
              <label>必须遵守的约束条件</label>
              <textarea
                rows={2}
                placeholder="例如：不能修改数据库结构；必须兼容某个浏览器版本；禁止上传隐私数据……"
                value={form.contextConstraints}
                onChange={handleInputChange("contextConstraints")}
              />
            </div>
            <div className="field-group">
              <label>当前问题与瓶颈</label>
              <textarea
                rows={2}
                placeholder="例如：现在 Prompt 太宽泛，生成代码经常破坏原本逻辑……"
                value={form.contextPainPoints}
                onChange={handleInputChange("contextPainPoints")}
              />
            </div>
          </section>

          {/* 输入内容 */}
          <section className="card">
            <h3>输入内容</h3>
            <div className="field-group">
              <label>输入代码片段</label>
              <textarea
                rows={3}
                placeholder="可粘贴一小段代表性的代码（不建议一次性贴整项目）。"
                value={form.inputCode}
                onChange={handleInputChange("inputCode")}
              />
            </div>
            <div className="field-group">
              <label>输入数据结构</label>
              <textarea
                rows={3}
                placeholder="可描述或用伪代码给出核心数据结构。"
                value={form.inputDataStructures}
                onChange={handleInputChange("inputDataStructures")}
              />
            </div>
            <div className="field-group">
              <label>输入 API 返回值</label>
              <textarea
                rows={3}
                placeholder="可粘贴典型的 JSON 返回示例。"
                value={form.inputApiResponse}
                onChange={handleInputChange("inputApiResponse")}
              />
            </div>
            <div className="field-group">
              <label>输入 UI 草图或界面描述</label>
              <textarea
                rows={3}
                placeholder="用文字描述 UI 布局、风格、交互（或简单链接到草图）。"
                value={form.inputUiDescription}
                onChange={handleInputChange("inputUiDescription")}
              />
            </div>
          </section>

          {/* 输出规范 */}
          <section className="card">
            <h3>输出规范</h3>
            <div className="field-group">
              <label>输出形式要求</label>
              <textarea
                rows={2}
                placeholder="例如：需要分节标题、编号列表、单独的代码块等。"
                value={form.outputFormatRequirements}
                onChange={handleInputChange("outputFormatRequirements")}
              />
            </div>
            <div className="field-group">
              <label>代码注释要求</label>
              <textarea
                rows={2}
                placeholder="例如：需要中文注释，解释关键业务逻辑和边界条件。"
                value={form.outputCommentRequirements}
                onChange={handleInputChange("outputCommentRequirements")}
              />
            </div>
            <div className="field-group">
              <label>是否需要测试用例</label>
              <select
                value={form.outputNeedTests}
                onChange={handleInputChange("outputNeedTests")}
              >
                <option value="auto">由模型自行判断（推荐）</option>
                <option value="yes">必须提供测试样例</option>
                <option value="no">可以不提供测试</option>
              </select>
            </div>
          </section>

          {/* 风格与限制 */}
          <section className="card">
            <h3>风格与限制</h3>
            <div className="field-group">
              <label>是否允许使用第三方库</label>
              <select
                value={form.styleThirdPartyLibs}
                onChange={handleInputChange("styleThirdPartyLibs")}
              >
                <option value="allowed">允许（只要合理）</option>
                <option value="limited">允许，但需事先说明理由</option>
                <option value="forbidden">禁止使用第三方库</option>
              </select>
            </div>
            <div className="field-group">
              <label>代码风格偏好</label>
              <textarea
                rows={2}
                placeholder="例如：hooks 优先，少用 class 组件，函数式写法，尽量无副作用等。"
                value={form.styleCodeStyle}
                onChange={handleInputChange("styleCodeStyle")}
              />
            </div>
            <div className="field-group">
              <label>命名习惯</label>
              <textarea
                rows={2}
                placeholder="例如：变量 camelCase，组件 PascalCase，常量全大写等。"
                value={form.styleNaming}
                onChange={handleInputChange("styleNaming")}
              />
            </div>
            <div className="field-group">
              <label>禁止修改的部分</label>
              <textarea
                rows={2}
                placeholder="例如：禁止改动某文件 / 某模块；禁止移除现有日志等。"
                value={form.styleForbiddenAreas}
                onChange={handleInputChange("styleForbiddenAreas")}
              />
            </div>
          </section>

          {/* 示例参考 */}
          <section className="card">
            <h3>示例参考</h3>
            <div className="field-group">
              <label>风格参考示例</label>
              <textarea
                rows={2}
                placeholder="可以粘贴你觉得很好的 Prompt 片段、GitHub 仓库链接，或者简单描述风格。"
                value={form.exampleReference}
                onChange={handleInputChange("exampleReference")}
              />
            </div>
          </section>

          {errorMsg && <p className="error-text fade-in-up">{errorMsg}</p>}
        </form>

        {/* 右侧：输出列 */}
        <section className="output-column fade-in-up">
          <div className="card output-card">
            <div className="output-header">
              <h2>优化后的 Prompt（Markdown）</h2>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleCopy}
                disabled={!optimizedPrompt}
              >
                复制 Prompt
              </button>
            </div>

            <p className="output-tip">
              ✅ 生成内容会使用 Markdown 语法，并在其中嵌入整理后的 JSON 结构，方便在其他模型中直接复用。
            </p>

            <div className="output-box">
              {isLoading && (
                <div className="output-loading">
                  <span className="spinner-large" />
                  <span>DeepSeek 正在思考你的 Prompt…</span>
                </div>
              )}

              {!isLoading && !optimizedPrompt && (
                <div className="output-placeholder">
                  <p>
                    在左侧填入任务与上下文信息，然后点击“生成优化 Prompt”。这里会显示可直接复制的
                    Markdown Prompt。
                  </p>
                </div>
              )}

              {!isLoading && optimizedPrompt && (
                <textarea
                  className="output-textarea"
                  value={optimizedPrompt}
                  readOnly
                />
              )}
            </div>

            {copyStatus && (
              <p className="copy-status fade-in-up">{copyStatus}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  </div>
);


export default App;
