import React, { useState } from "react";

/**
 * 主页面组件：整体表单 + 调参 + 输出
 */
export default function App() {
  // ========== 默认示例内容 ==========
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
      data_structures: "可提供 TS 类型、接口定义等。",
      api_responses: "支持 JSON 格式的 REST API 返回值。",
      ui_description: "可描述 UI 草图、布局结构或交互流程。",
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

  // ========== 主题 ==========
  const [theme, setTheme] = useState("light");
  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // ========== 表单状态 ==========
  const [form, setForm] = useState({
    taskGoal: "",
    taskQuality: "",
    taskOutputFormat: "",
    contextBackground: "",
    contextTechStack: "",
    contextRuntime: "",
    contextConstraints: "",
    contextPainPoints: "",
    inputCode: "",
    inputDataStructures: "",
    inputApiResponse: "",
    inputUiDescription: "",
    outputFormatRequirements: "",
    outputCommentRequirements: "",
    outputNeedTests: "auto",
    styleThirdPartyLibs: "allowed",
    styleCodeStyle: "",
    styleNaming: "",
    styleForbiddenAreas: "",
    exampleReference: "",
  });

  const handleInputChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ========== DeepSeek 调参 ==========
  const [model, setModel] = useState("deepseek-chat");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState("2048");

  // ========== 输出状态 ==========
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  // ========== 工具函数 ==========
  const normalizeMaxTokens = (value) => {
    const parsed = parseInt(value || "2048", 10);
    if (isNaN(parsed)) return "2048";
    const clamped = Math.min(8192, Math.max(256, parsed));
    return String(clamped);
  };

  const autoFill = (v, d) => (!v || !v.trim() ? d : v.trim());

  // ========== 提交 ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setOptimizedPrompt("");
    setCopyStatus("");

    try {
      const safeMaxTokens = parseInt(normalizeMaxTokens(maxTokens), 10);

      const payload = {
        model,
        temperature,
        top_p: topP,
        max_tokens: safeMaxTokens,
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
            api_responses: autoFill(
              form.inputApiResponse,
              demoDefaults.input_content.api_responses
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

      const res = await fetch("http://localhost:3000/api/prompt-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`服务器返回错误：${res.status}`);

      const data = await res.json();
      if (!data.prompt) throw new Error("后端未返回 prompt 字段。");

      setOptimizedPrompt(data.prompt);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "调用 DeepSeek 失败");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 复制 ==========
  const handleCopy = async () => {
    if (!optimizedPrompt) return;
    try {
      await navigator.clipboard.writeText(optimizedPrompt);
      setCopyStatus("已复制到剪贴板");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch {
      setCopyStatus("复制失败，请手动复制");
    }
  };

  // ========== UI ==========
  return (
    <div className={`app-root ${theme === "light" ? "theme-light" : "theme-dark"}`}>
      <div className="app-gradient-bg" />

      <div className="app-container">
        <header className="app-header fade-in-up">
          <div className="app-header-left">
            <div className="app-title-block">
              <h1>Prompt Optimizer for Vibecoding</h1>
              <p className="app-subtitle">
                填写任务、上下文和约束，自动生成结构化 Markdown Prompt（含 JSON）。
              </p>
            </div>

            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === "dark" ? "🌙 深色模式" : "☀️ 浅色模式"}
            </button>
          </div>

          {/* 顶部参数 */}
          <div className="app-header-controls">
            <div className="field-group">
              <label>模型</label>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="deepseek-chat">deepseek-chat</option>
                <option value="deepseek-reasoner">deepseek-reasoner</option>
              </select>
            </div>

            <div className="field-group slider-group">
              <label>
                温度 <span className="slider-value">{temperature.toFixed(2)}</span>
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

            <div className="field-group small-number">
              <label>max_tokens</label>
              <input
                type="number"
                min="256"
                max="8192"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                onBlur={() => setMaxTokens(normalizeMaxTokens(maxTokens))}
              />
            </div>
          </div>
        </header>

        {/* 主体 */}
        <main className="app-main">
          <form className="form-column fade-in-up" onSubmit={handleSubmit}>
            <div className="form-header-row">
              <h2>信息输入</h2>

              <div className="form-header-actions">
                <button
                  type="submit"
                  className={`primary-btn ${isLoading ? "primary-btn-loading" : ""}`}
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

            {/* 各 section 都保留，不删 */}
            {/* ===== 任务信息 ===== */}
            <section className="card">
              <h3>任务信息</h3>
              <div className="field-group">
                <label>任务目标</label>
                <textarea
                  rows={2}
                  value={form.taskGoal}
                  onChange={handleInputChange("taskGoal")}
                  placeholder="描述你的任务目标…"
                />
              </div>

              <div className="field-group">
                <label>预期质量要求</label>
                <textarea
                  rows={2}
                  value={form.taskQuality}
                  onChange={handleInputChange("taskQuality")}
                />
              </div>

              <div className="field-group">
                <label>最终输出形式</label>
                <input
                  value={form.taskOutputFormat}
                  onChange={handleInputChange("taskOutputFormat")}
                />
              </div>
            </section>

            {/* ===== 上下文信息 ===== */}
            <section className="card">
              <h3>上下文信息</h3>
              <div className="field-group">
                <label>项目背景</label>
                <textarea
                  rows={2}
                  value={form.contextBackground}
                  onChange={handleInputChange("contextBackground")}
                />
              </div>

              <div className="field-group">
                <label>技术栈版本</label>
                <textarea
                  rows={2}
                  value={form.contextTechStack}
                  onChange={handleInputChange("contextTechStack")}
                />
              </div>

              <div className="field-group">
                <label>运行环境</label>
                <input
                  value={form.contextRuntime}
                  onChange={handleInputChange("contextRuntime")}
                />
              </div>

              <div className="field-group">
                <label>必须遵守的约束条件</label>
                <textarea
                  rows={2}
                  value={form.contextConstraints}
                  onChange={handleInputChange("contextConstraints")}
                />
              </div>

              <div className="field-group">
                <label>当前问题与瓶颈</label>
                <textarea
                  rows={2}
                  value={form.contextPainPoints}
                  onChange={handleInputChange("contextPainPoints")}
                />
              </div>
            </section>

            {/* ===== 输入内容 ===== */}
            <section className="card">
              <h3>输入内容</h3>
              <div className="field-group">
                <label>输入代码片段</label>
                <textarea
                  rows={3}
                  value={form.inputCode}
                  onChange={handleInputChange("inputCode")}
                />
              </div>

              <div className="field-group">
                <label>输入数据结构</label>
                <textarea
                  rows={3}
                  value={form.inputDataStructures}
                  onChange={handleInputChange("inputDataStructures")}
                />
              </div>

              <div className="field-group">
                <label>输入 API 返回值</label>
                <textarea
                  rows={3}
                  value={form.inputApiResponse}
                  onChange={handleInputChange("inputApiResponse")}
                />
              </div>

              <div className="field-group">
                <label>输入 UI 草图或描述</label>
                <textarea
                  rows={3}
                  value={form.inputUiDescription}
                  onChange={handleInputChange("inputUiDescription")}
                />
              </div>
            </section>

            {/* ===== 输出规范 ===== */}
            <section className="card">
              <h3>输出规范</h3>
              <div className="field-group">
                <label>输出形式要求</label>
                <textarea
                  rows={2}
                  value={form.outputFormatRequirements}
                  onChange={handleInputChange("outputFormatRequirements")}
                />
              </div>

              <div className="field-group">
                <label>代码注释要求</label>
                <textarea
                  rows={2}
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
                  <option value="auto">模型自行判断</option>
                  <option value="yes">必须提供测试</option>
                  <option value="no">不需要测试</option>
                </select>
              </div>
            </section>

            {/* ===== 风格与限制 ===== */}
            <section className="card">
              <h3>风格与限制</h3>
              <div className="field-group">
                <label>是否允许使用第三方库</label>
                <select
                  value={form.styleThirdPartyLibs}
                  onChange={handleInputChange("styleThirdPartyLibs")}
                >
                  <option value="allowed">允许</option>
                  <option value="limited">允许但需理由</option>
                  <option value="forbidden">禁止</option>
                </select>
              </div>

              <div className="field-group">
                <label>代码风格偏好</label>
                <textarea
                  rows={2}
                  value={form.styleCodeStyle}
                  onChange={handleInputChange("styleCodeStyle")}
                />
              </div>

              <div className="field-group">
                <label>命名习惯</label>
                <textarea
                  rows={2}
                  value={form.styleNaming}
                  onChange={handleInputChange("styleNaming")}
                />
              </div>

              <div className="field-group">
                <label>禁止修改的部分</label>
                <textarea
                  rows={2}
                  value={form.styleForbiddenAreas}
                  onChange={handleInputChange("styleForbiddenAreas")}
                />
              </div>
            </section>

            {/* ===== 示例参考 ===== */}
            <section className="card">
              <h3>示例参考</h3>
              <div className="field-group">
                <label>风格参考示例</label>
                <textarea
                  rows={2}
                  value={form.exampleReference}
                  onChange={handleInputChange("exampleReference")}
                />
              </div>
            </section>

            {errorMsg && <p className="error-text fade-in-up">{errorMsg}</p>}
          </form>

          {/* ===== 右侧输出 ===== */}
          <section className="output-column fade-in-up">
            <div className="card output-card">
              <div className="output-header">
                <h2>优化后的 Prompt（Markdown）</h2>

                <button
                  className="secondary-btn"
                  onClick={handleCopy}
                  disabled={!optimizedPrompt}
                >
                  复制
                </button>
              </div>

              <p className="output-tip">
                生成内容使用 Markdown 语法，并包含结构化 JSON，方便直接复用。
              </p>

              <div className="output-box">
                {isLoading && (
                  <div className="output-loading">
                    <span className="spinner-large" />
                    <span>DeepSeek 正在生成…</span>
                  </div>
                )}

                {!isLoading && !optimizedPrompt && (
                  <div className="output-placeholder">
                    <p>在左侧填写内容并点击“生成优化 Prompt”。</p>
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
}
