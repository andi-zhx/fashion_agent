const stageLabels = {
  market: "市场机会",
  design: "AI 款式",
  materials: "面辅料",
  techpack: "技术包",
  sample: "打样",
  production: "生产质检",
  commerce: "上架复盘"
};

const palettes = {
  "轻商务极简": [["炭灰", "#30343b"], ["雾白", "#f1f4f2"], ["橄榄绿", "#657467"], ["陶土红", "#aa5c4f"]],
  "新中式通勤": [["墨黑", "#202124"], ["竹青", "#547265"], ["米灰", "#d8d2c5"], ["朱砂", "#b8554a"]],
  "户外城市机能": [["玄武黑", "#22252b"], ["苔藓绿", "#4b6b54"], ["石灰", "#cfd5d3"], ["警示橙", "#d8783f"]],
  "复古运动": [["奶油白", "#eee8d7"], ["赛车红", "#c4493f"], ["孔雀蓝", "#2f6c8f"], ["松针绿", "#355c4a"]],
  "甜酷派对": [["烟粉", "#c9828a"], ["夜黑", "#191b20"], ["银灰", "#b9c0c8"], ["电光蓝", "#496fe1"]]
};

const state = { status: null, project: null, activeStage: "market" };

const dom = {
  form: document.querySelector("#briefForm"),
  modelStatus: document.querySelector("#modelStatus"),
  projectName: document.querySelector("#projectName"),
  swatches: document.querySelector("#swatches"),
  kpiGrid: document.querySelector("#kpiGrid"),
  assistantNote: document.querySelector("#assistantNote"),
  pipeline: document.querySelector("#pipeline"),
  stageTabs: document.querySelector("#stageTabs"),
  stageTitle: document.querySelector("#stageTitle"),
  stageContent: document.querySelector("#stageContent"),
  techpackContent: document.querySelector("#techpackContent"),
  resourceGrid: document.querySelector("#resourceGrid"),
  modelConfigPreview: document.querySelector("#modelConfigPreview"),
  toast: document.querySelector("#toast")
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[char]);
}

function serializeBrief() {
  const data = new FormData(dom.form);
  return {
    category: String(data.get("category")),
    audience: String(data.get("audience")),
    style: String(data.get("style")),
    channel: String(data.get("channel")),
    price_tier: String(data.get("price_tier")),
    quantity: Number(data.get("quantity") || 120),
    season: String(data.get("season")),
    region: String(data.get("region")),
    idea: String(data.get("idea") || "").trim()
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadStatus() {
  try {
    state.status = await requestJson("/api/status");
    const model = state.status.model;
    dom.modelStatus.textContent = model.configured ? `大模型已连接：${model.model}` : "本地规则引擎";
    dom.modelStatus.classList.toggle("connected", Boolean(model.configured));
    dom.modelConfigPreview.textContent = JSON.stringify({
      enabled: true,
      provider: "openai-compatible",
      base_url: "https://your-provider.example.com/v1/chat/completions",
      model: "your-model-name",
      api_key_env: "FASHION_AI_API_KEY",
      timeout: 30
    }, null, 2);
  } catch (error) {
    dom.modelStatus.textContent = "接口未启动";
    showToast(error.message);
  }
}

async function generateProject(useModel = false) {
  setBusy(true);
  try {
    const project = await requestJson("/api/generate", { method: "POST", body: JSON.stringify({ brief: serializeBrief(), use_model: useModel }) });
    state.project = project;
    state.activeStage = "market";
    renderProject();
    showToast(project.engine === "rules+model" ? "已生成大模型增强方案" : "已生成本地规则方案");
  } catch (error) {
    showToast(`生成失败：${error.message}`);
  } finally {
    setBusy(false);
  }
}

function setBusy(isBusy) {
  dom.form.querySelector("button[type='submit']").disabled = isBusy;
  dom.form.querySelector("button[type='submit']").textContent = isBusy ? "生成中" : "生成全流程方案";
}

function renderProject() {
  renderHero();
  renderPipeline();
  renderStageTabs();
  renderStageContent();
  renderTechpack();
  renderResources();
}

function renderHero() {
  const project = state.project;
  if (!project) {
    dom.projectName.textContent = "等待生成项目";
    dom.swatches.innerHTML = renderSwatches(palettes["轻商务极简"]);
    dom.kpiGrid.innerHTML = renderKpis([["开发阶段", "7"], ["资源", "待匹配"], ["周期", "待生成"], ["状态", "Brief"]]);
    return;
  }
  dom.projectName.textContent = project.name;
  dom.swatches.innerHTML = renderSwatches(palettes[project.brief.style] || palettes["轻商务极简"]);
  dom.kpiGrid.innerHTML = renderKpis([["可落地度", `${project.summary.readiness}%`], ["预计周期", project.summary.lead_time], ["单件成本", project.summary.unit_cost], ["试产规模", project.summary.pilot_quantity]]);
  dom.assistantNote.textContent = project.summary.positioning;
}

function renderSwatches(colors) {
  return colors.map(([name, color]) => `<span class="swatch"><b style="background:${color}"></b>${escapeHtml(name)}</span>`).join("");
}

function renderKpis(items) {
  return items.map(([label, value]) => `<div class="kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function renderPipeline() {
  const steps = state.project?.pipeline || [
    { stage: "市场机会", output: "目标用户、场景、价格带、试产策略", status: "待生成" },
    { stage: "AI 款式", output: "款式方向、颜色、图像提示词", status: "待生成" },
    { stage: "面辅料", output: "BOM、替代料、起订量、交期", status: "待生成" },
    { stage: "技术包", output: "尺寸表、工艺说明、包装", status: "待生成" },
    { stage: "打样生产", output: "样衣单、修改记录、小单排期", status: "待生成" },
    { stage: "质检交付", output: "检测计划、抽检清单", status: "待生成" },
    { stage: "销售复盘", output: "上架文案、短视频脚本", status: "待生成" }
  ];
  dom.pipeline.innerHTML = steps.map((step, index) => `<article class="pipeline-step"><span>${String(index + 1).padStart(2, "0")} / ${escapeHtml(step.status)}</span><strong>${escapeHtml(step.stage)}</strong><p>${escapeHtml(step.output)}</p></article>`).join("");
}

function renderStageTabs() {
  dom.stageTabs.innerHTML = Object.entries(stageLabels).map(([id, label]) => `<button class="stage-tab ${id === state.activeStage ? "active" : ""}" data-stage="${id}">${escapeHtml(label)}</button>`).join("");
}

function renderStageContent() {
  const section = state.project?.sections?.[state.activeStage];
  dom.stageTitle.textContent = section?.title || "智能生成结果";
  if (!section) {
    dom.stageContent.innerHTML = `<div class="empty-state">生成方案后，这里会展示对应阶段的可执行资料。</div>`;
    return;
  }
  if (state.activeStage === "materials") {
    dom.stageContent.innerHTML = `<article class="table-card"><h4>BOM 草案</h4>${renderTable(["类别", "资源", "用量", "报价"], section.bom)}</article>`;
    return;
  }
  if (state.activeStage === "techpack") {
    dom.stageContent.innerHTML = `<article class="table-card"><h4>规格信息</h4>${renderTable(["字段", "内容"], section.specs)}</article><article class="table-card"><h4>尺寸基准</h4>${renderTable(["部位", "规格", "公差"], section.measurements)}</article>`;
    return;
  }
  if (state.activeStage === "production") {
    dom.stageContent.innerHTML = `<article class="text-card"><h4>质检清单</h4>${renderList(section.quality)}</article>`;
    return;
  }
  if (state.activeStage === "commerce") {
    dom.stageContent.innerHTML = `<article class="text-card"><h4>上架文案</h4>${renderList(section.copy)}</article><article class="table-card"><h4>复盘指标</h4>${renderTable(["指标", "预估"], section.metrics.map(([a, b]) => [a, `${b}%`]))}</article>`;
    return;
  }
  const body = section.body || [];
  const extra = section.prompts ? `<article class="text-card"><h4>AI 图像提示词</h4>${renderList(section.prompts)}</article>` : "";
  const risks = section.risks ? `<article class="text-card"><h4>风险提醒</h4><div class="tag-row">${section.risks.map((risk) => `<span class="tag">${escapeHtml(risk)}</span>`).join("")}</div></article>` : "";
  dom.stageContent.innerHTML = `<article class="text-card"><h4>执行建议</h4>${renderList(body)}</article>${extra}${risks}`;
}

function renderTechpack() {
  const techpack = state.project?.sections?.techpack;
  if (!techpack) {
    dom.techpackContent.innerHTML = `<div class="empty-state">技术包会在生成后自动形成尺寸表、工艺要求、BOM 和包装质检要求。</div>`;
    return;
  }
  dom.techpackContent.innerHTML = `<article class="table-card">${renderTable(["字段", "内容"], techpack.specs)}</article><article class="table-card">${renderTable(["部位", "规格", "公差"], techpack.measurements)}</article><article class="text-card"><h4>工艺与包装</h4>${renderList(techpack.workmanship)}</article>`;
}

function renderResources() {
  const resources = state.project?.sections?.materials?.resources || [];
  if (!resources.length) {
    dom.resourceGrid.innerHTML = `<div class="empty-state">生成方案后自动匹配面辅料、工厂和质检资源。</div>`;
    return;
  }
  dom.resourceGrid.innerHTML = resources.map((resource) => `<article class="resource-card"><header><div><span class="label">${escapeHtml(resource.kind)}</span><h4>${escapeHtml(resource.name)}</h4></div><span class="score">${escapeHtml(resource.match_score)}</span></header><p>${escapeHtml(resource.note)}</p><div class="meta-list"><span>报价：${escapeHtml(resource.cost)}</span><span>起订：${escapeHtml(resource.moq)}</span><span>交期：${escapeHtml(resource.lead_time)}</span><span>区域：${escapeHtml(resource.region)}</span></div></article>`).join("");
}

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderTable(headers, rows) {
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function exportCurrentProject() {
  if (!state.project) {
    showToast("请先生成方案");
    return;
  }
  const blob = new Blob([JSON.stringify(state.project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.project.name.replace(/\s+/g, "-")}-开发包.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  window.setTimeout(() => dom.toast.classList.remove("show"), 2400);
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.scrollTarget}`).scrollIntoView({ block: "start" });
  });
});

dom.stageTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stage]");
  if (!button) return;
  state.activeStage = button.dataset.stage;
  renderStageTabs();
  renderStageContent();
});

dom.form.addEventListener("submit", (event) => {
  event.preventDefault();
  generateProject(Boolean(new FormData(dom.form).get("use_model")));
});

document.querySelector("#loadDemo").addEventListener("click", () => {
  dom.form.elements.category.value = "通勤外套";
  dom.form.elements.audience.value = "25-35 岁通勤女性";
  dom.form.elements.style.value = "轻商务极简";
  dom.form.elements.channel.value = "小红书种草与私域预售";
  dom.form.elements.price_tier.value = "399-699 元";
  dom.form.elements.quantity.value = 120;
  dom.form.elements.season.value = "秋冬";
  dom.form.elements.region.value = "长三角";
  dom.form.elements.idea.value = "希望做一件适合城市通勤、能覆盖早晚温差、上镜但不过度夸张的外套。";
  generateProject(false);
});

document.querySelector("#exportProject").addEventListener("click", exportCurrentProject);

loadStatus();
renderProject();
