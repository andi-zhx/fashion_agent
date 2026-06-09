const stages = [
  { id: "opportunity", short: "01", title: "市场机会", owner: "AI 策略助手", deliverable: "机会判断报告" },
  { id: "design", short: "02", title: "款式设计", owner: "AI 设计助手", deliverable: "款式方向与图像提示词" },
  { id: "materials", short: "03", title: "面辅料匹配", owner: "材料资源库", deliverable: "BOM 与替代料方案" },
  { id: "techpack", short: "04", title: "产品资料包", owner: "技术包生成器", deliverable: "尺寸、工艺、颜色、包装" },
  { id: "sampling", short: "05", title: "打样协同", owner: "版师与样衣工厂", deliverable: "样衣单与修改记录" },
  { id: "production", short: "06", title: "小单生产", owner: "快反工厂", deliverable: "排期、成本和风险" },
  { id: "quality", short: "07", title: "质检保障", owner: "第三方质检", deliverable: "检测计划与抽检清单" },
  { id: "sales", short: "08", title: "销售复盘", owner: "销售素材助手", deliverable: "上架素材与反馈指标" }
];

const resources = [
  { id: "fabric-1", type: "主面料", name: "抗皱 TR 斜纹混纺", fit: ["通勤外套", "跨境女装连衣裙"], region: "长三角快反供应链", price: "28-36 元/米", moq: "80 米", leadTime: "3-5 天", score: 94, note: "适合利落廓形，耐穿且易打理，适合中高频通勤场景。", tags: ["抗皱", "垂感", "现货色卡"] },
  { id: "fabric-2", type: "主面料", name: "环保再生尼龙防泼水布", fit: ["户外机能夹克", "音乐节上衣"], region: "珠三角跨境供应链", price: "34-48 元/米", moq: "100 米", leadTime: "5-7 天", score: 91, note: "轻量、耐磨、适合城市机能与跨境户外风格。", tags: ["防泼水", "再生纤维", "机能"] },
  { id: "fabric-3", type: "主面料", name: "亲肤棉羊毛针织", fit: ["亲肤针织套装", "通勤外套"], region: "成渝女装供应链", price: "42-58 元/公斤", moq: "60 公斤", leadTime: "7-10 天", score: 88, note: "触感柔软，适合打造低刺激、温暖型单品。", tags: ["亲肤", "保暖", "可小单"] },
  { id: "trim-1", type: "辅料", name: "低调哑光树脂扣", fit: ["通勤外套", "跨境女装连衣裙", "亲肤针织套装"], region: "长三角快反供应链", price: "0.28-0.62 元/粒", moq: "500 粒", leadTime: "2-4 天", score: 89, note: "适合轻商务和极简风格，颜色稳定，补货快。", tags: ["纽扣", "哑光", "可打样"] },
  { id: "trim-2", type: "辅料", name: "YKK 同级别顺滑拉链", fit: ["户外机能夹克", "音乐节上衣"], region: "珠三角跨境供应链", price: "3.8-7.5 元/条", moq: "100 条", leadTime: "4-6 天", score: 92, note: "适合外套、机能口袋和可拆卸结构，耐用性好。", tags: ["拉链", "耐磨", "机能"] },
  { id: "factory-1", type: "样衣工厂", name: "杭州女装小单快反工坊", fit: ["通勤外套", "跨境女装连衣裙", "亲肤针织套装"], region: "长三角快反供应链", price: "样衣 650-1500 元/件", moq: "50 件起", leadTime: "7-12 天", score: 93, note: "擅长女装版型、样衣修改和中小批量快反。", tags: ["打版", "样衣", "快反"] },
  { id: "factory-2", type: "生产工厂", name: "广州跨境女装柔性工厂", fit: ["音乐节上衣", "跨境女装连衣裙", "户外机能夹克"], region: "珠三角跨境供应链", price: "加工费 38-120 元/件", moq: "80 件起", leadTime: "10-18 天", score: 90, note: "熟悉 TikTok Shop、独立站和跨境包装标准。", tags: ["跨境", "柔性生产", "包装"] },
  { id: "qc-1", type: "质检服务", name: "第三方成衣与面辅料检测", fit: ["通勤外套", "音乐节上衣", "户外机能夹克", "跨境女装连衣裙", "亲肤针织套装"], region: "全国", price: "按项目报价", moq: "按批次", leadTime: "2-5 天", score: 96, note: "覆盖面辅料检测、尺寸检验、外观检验、包装检验和出货前抽检。", tags: ["中检资源", "抽检", "报告"] }
];

const colorPalettes = {
  "轻商务极简": [["炭灰", "#30343b"], ["雾白", "#f1f4f2"], ["橄榄绿", "#657467"], ["陶土红", "#aa5c4f"]],
  "新中式通勤": [["墨黑", "#202124"], ["竹青", "#547265"], ["米灰", "#d8d2c5"], ["朱砂", "#b8554a"]],
  "复古运动": [["奶油白", "#eee8d7"], ["赛车红", "#c4493f"], ["孔雀蓝", "#2f6c8f"], ["松针绿", "#355c4a"]],
  "甜酷派对": [["烟粉", "#c9828a"], ["夜黑", "#191b20"], ["银灰", "#b9c0c8"], ["电光蓝", "#496fe1"]],
  "户外城市机能": [["玄武黑", "#22252b"], ["苔藓绿", "#4b6b54"], ["石灰", "#cfd5d3"], ["警示橙", "#d8783f"]]
};

const defaultBrief = {
  category: "通勤外套",
  audience: "25-35 岁通勤女性",
  style: "轻商务极简",
  channel: "小红书种草与私域预售",
  priceTier: "399-699 元",
  quantity: 120,
  season: "秋冬",
  region: "长三角快反供应链",
  idea: "希望做一件适合城市通勤、能覆盖早晚温差、上镜但不过度夸张的外套。"
};

let activeView = "workspace";
let activeStage = "opportunity";
let activeFilter = "全部";
let activeProject = null;

const dom = {
  viewTitle: document.querySelector("#viewTitle"),
  navItems: document.querySelectorAll(".nav-item"),
  views: {
    workspace: document.querySelector("#workspaceView"),
    resources: document.querySelector("#resourcesView"),
    pipeline: document.querySelector("#pipelineView"),
    insights: document.querySelector("#insightsView")
  },
  form: document.querySelector("#briefForm"),
  projectName: document.querySelector("#projectName"),
  projectStatus: document.querySelector("#projectStatus"),
  stageTabs: document.querySelector("#stageTabs"),
  stageContent: document.querySelector("#stageContent"),
  loadDemoButton: document.querySelector("#loadDemoButton"),
  exportButton: document.querySelector("#exportButton"),
  resourceFilters: document.querySelector("#resourceFilters"),
  resourceGrid: document.querySelector("#resourceGrid"),
  pipelineTimeline: document.querySelector("#pipelineTimeline"),
  insightLayout: document.querySelector("#insightLayout"),
  metrics: {
    stage: document.querySelector("#metricStage"),
    resources: document.querySelector("#metricResources"),
    leadTime: document.querySelector("#metricLeadTime"),
    status: document.querySelector("#metricStatus")
  }
};

function readBrief(form) {
  const data = new FormData(form);
  return {
    category: String(data.get("category")),
    audience: String(data.get("audience")),
    style: String(data.get("style")),
    channel: String(data.get("channel")),
    priceTier: String(data.get("priceTier")),
    quantity: Number(data.get("quantity")),
    season: String(data.get("season")),
    region: String(data.get("region")),
    idea: String(data.get("idea")).trim()
  };
}

function generateProject(brief) {
  const matched = resources
    .map((resource) => {
      const categoryMatch = resource.fit.includes(brief.category) ? 38 : 0;
      const regionMatch = resource.region === brief.region || resource.region === "全国" ? 22 : 0;
      const typeBoost = resource.type === "质检服务" ? 12 : 0;
      return { ...resource, matchScore: Math.min(99, resource.score + categoryMatch + regionMatch + typeBoost - 42) };
    })
    .filter((resource) => resource.matchScore >= 70)
    .sort((a, b) => b.matchScore - a.matchScore);

  const fabrics = matched.filter((item) => item.type === "主面料").slice(0, 2);
  const trims = matched.filter((item) => item.type === "辅料").slice(0, 2);
  const factories = matched.filter((item) => item.type.includes("工厂")).slice(0, 2);
  const qc = matched.find((item) => item.type === "质检服务") || resources.find((item) => item.type === "质检服务");
  const estimatedLeadTime = brief.quantity > 300 ? 34 : brief.quantity > 120 ? 28 : 23;
  const unitCost = estimateUnitCost(brief, fabrics);
  const name = `${brief.style} ${brief.category}`;
  const palette = colorPalettes[brief.style] || colorPalettes["轻商务极简"];

  return {
    id: `P-${Date.now()}`,
    name,
    brief,
    matchedResources: matched,
    estimatedLeadTime,
    unitCost,
    readiness: Math.min(96, 72 + matched.length * 3),
    generatedAt: new Date().toISOString(),
    stages: {
      opportunity: {
        headline: `${brief.category} 在 ${brief.channel} 适合用小单快反验证`,
        summary: `${brief.audience} 对兼顾场景感、上身效果和价格确定性的单品需求较强。建议先以 ${brief.quantity} 件试产规模验证内容转化，再根据尺码、颜色和评价反馈追加生产。`,
        signals: [
          `${brief.channel} 更适合先用场景穿搭内容验证款式，而不是直接重库存铺货。`,
          `${brief.priceTier} 的价格带需要在面料质感、版型稳定性和可复购包装上形成差异。`,
          `${brief.season} 产品应提前锁定主面料和替代料，避免打样完成后出现缺料。`
        ],
        risks: ["个人审美替代市场判断", "样衣反复修改导致周期拉长", "试产尺码分布不清造成库存偏差"],
        deliverable: "市场机会判断、目标用户、价格带、试产策略"
      },
      design: {
        headline: "AI 款式生成方向",
        summary: brief.idea,
        silhouette: ["版型以易穿、可量产和便于尺码放码为先。", "保留一个视觉记忆点，避免复杂结构增加打样成本。", "首批建议 2 个主色、1 个限定色，控制库存风险。"],
        palette,
        prompts: [
          `fashion design concept, ${brief.category}, ${brief.style}, target customer ${brief.audience}, real garment, production ready`,
          `technical flat sketch, front and back view, ${brief.category}, clean seam lines, fabric texture, trims placement`,
          `lookbook photo, ${brief.channel}, ${brief.style}, wearable styling, commercial fashion product`
        ],
        deliverable: "款式方向、颜色方案、AI 图像提示词、设计注意事项"
      },
      materials: {
        headline: "面辅料与可替代资源匹配",
        fabrics,
        trims,
        bom: buildBom(brief, fabrics, trims),
        alternatives: ["主面料至少保留 1 个相同手感、相近克重的替代供应商。", "纽扣、拉链、洗标和包装辅料在样衣阶段同步确认实物。", "如走跨境渠道，优先确认洗标规范、成分标识和包装耐运输性。"],
        deliverable: "BOM、材料成本、最小起订量、交期和替代料"
      },
      techpack: {
        headline: "可生产产品资料包",
        specs: [["品类", brief.category], ["目标客群", brief.audience], ["销售渠道", brief.channel], ["目标零售价", brief.priceTier], ["试产数量", `${brief.quantity} 件`], ["生产区域", brief.region]],
        measurements: buildMeasurements(brief.category),
        workmanship: ["关键部位缝份、止口、压线宽度在工艺单中明确。", "尺码样确认后再进行 S/M/L 或跨境尺码放码。", "包装资料包含吊牌、洗标、尺码贴、外箱唛头和质检报告入口。"],
        deliverable: "设计说明、尺寸表、工艺单、BOM、包装和质检要求"
      },
      sampling: {
        headline: "打样与修改闭环",
        steps: ["提交款式图、BOM、尺寸基准和目标成本。", "版师 2 天内输出纸样或电子版型，样衣工厂确认工艺可行性。", "首版样衣完成后记录穿着、尺寸、面料、工艺和成本问题。", "二版样衣只处理关键修改，避免在样衣阶段无限扩散需求。"],
        owners: ["创作者", "平台商品开发", "版师", "样衣工厂"],
        deliverable: "打样需求单、样衣修改记录、确认样"
      },
      production: {
        headline: "小单快反生产计划",
        factories,
        timeline: buildTimeline(brief, estimatedLeadTime),
        cost: [["预估单件成本", `${unitCost} 元`], ["建议零售价", brief.priceTier], ["首批数量", `${brief.quantity} 件`], ["周期", `${estimatedLeadTime} 天`]],
        risks: ["批量面料和样衣面料存在色差，需要产前确认缸差。", "工厂排期应在确认样前预锁，避免确认后无产能。", "首单不建议超过渠道可承接销量，优先让数据决定返单。"],
        deliverable: "工厂匹配、排期、成本、产前风险"
      },
      quality: {
        headline: "第三方质检与交付保障",
        partner: qc,
        checklist: ["面辅料：成分、色牢度、缩水率、克重和瑕疵。", "成衣：尺寸、公差、缝制、线头、外观、对称性。", "包装：吊牌、洗标、尺码贴、条码、外箱和跨境运输标识。", "出货前：按批次抽检并形成可追溯报告。"],
        deliverable: "检测计划、抽检清单、质检报告"
      },
      sales: {
        headline: "上架素材与市场复盘",
        copy: [`${name}，为 ${brief.audience} 设计，兼顾真实穿着、镜头表现和小单快反品质。`, `首批 ${brief.quantity} 件试产，适合通过 ${brief.channel} 做预售、试穿反馈和返单验证。`],
        assets: ["AI 模特图：正面、侧面、细节、场景穿搭。", "商品详情：面料卖点、版型说明、尺码建议、洗护信息。", "短视频脚本：痛点开场、上身对比、细节特写、预售转化。"],
        metrics: [["内容互动率", 78], ["预售转化", 64], ["尺码反馈完整度", 82], ["返单信心", 71]],
        deliverable: "上架文案、视觉素材、复盘指标和返单建议"
      }
    }
  };
}

function estimateUnitCost(brief, fabrics) {
  const base = brief.category.includes("外套") || brief.category.includes("夹克") ? 128 : 72;
  const materialBoost = fabrics.length ? 18 : 10;
  const qtyDiscount = brief.quantity >= 300 ? -12 : brief.quantity >= 120 ? -6 : 0;
  const styleBoost = brief.style.includes("机能") ? 22 : brief.style.includes("派对") ? 14 : 8;
  return base + materialBoost + qtyDiscount + styleBoost;
}

function buildBom(brief, fabrics, trims) {
  const mainFabric = fabrics[0] || resources.find((resource) => resource.type === "主面料");
  const backupFabric = fabrics[1] || mainFabric;
  const trim = trims[0] || resources.find((resource) => resource.type === "辅料");
  return [
    ["主面料", mainFabric.name, "1.8-2.4 米/件", mainFabric.price, mainFabric.leadTime],
    ["替代主面料", backupFabric.name, "同克重或相近手感", backupFabric.price, backupFabric.leadTime],
    ["辅料", trim.name, "按款式结构确认", trim.price, trim.leadTime],
    ["包装", "吊牌、洗标、尺码贴、OPP 袋", "1 套/件", "1.2-3.5 元/件", "3-5 天"],
    ["质检", "面辅料与成衣抽检", `${brief.quantity} 件批次`, "按项目报价", "2-5 天"]
  ];
}

function buildMeasurements(category) {
  if (category.includes("外套") || category.includes("夹克")) {
    return [["肩宽", "S 39 / M 40.5 / L 42", "±1.0 cm"], ["胸围", "S 104 / M 108 / L 112", "±1.5 cm"], ["衣长", "S 62 / M 64 / L 66", "±1.0 cm"], ["袖长", "S 58 / M 59.5 / L 61", "±1.0 cm"]];
  }
  if (category.includes("连衣裙")) {
    return [["胸围", "S 88 / M 92 / L 96", "±1.0 cm"], ["腰围", "S 70 / M 74 / L 78", "±1.0 cm"], ["裙长", "S 112 / M 114 / L 116", "±1.5 cm"], ["下摆", "S 168 / M 172 / L 176", "±2.0 cm"]];
  }
  return [["肩宽", "S 38 / M 40 / L 42", "±1.0 cm"], ["胸围", "S 92 / M 96 / L 100", "±1.0 cm"], ["衣长", "S 54 / M 56 / L 58", "±1.0 cm"], ["袖长", "S 20 / M 21 / L 22", "±0.8 cm"]];
}

function buildTimeline(brief, leadTime) {
  return [
    { day: "D1-D2", title: "资料确认", text: "确认款式方向、BOM、目标成本、尺码基准和打样工艺。" },
    { day: "D3-D8", title: "版型与样衣", text: "版师建版，样衣工厂制作首版样衣并记录修改点。" },
    { day: "D9-D14", title: "确认样与产前样", text: "确认关键尺寸、工艺、面料颜色和包装资料。" },
    { day: `D15-D${leadTime - 3}`, title: "小单生产", text: `${brief.quantity} 件试产进入裁剪、缝制、整烫和包装。` },
    { day: `D${leadTime - 2}-D${leadTime}`, title: "质检与出货", text: "完成抽检、问题返修、质检报告和出货交接。" }
  ];
}

function render() {
  renderNavigation();
  renderMetrics();
  renderStageTabs();
  renderStageContent();
  renderResources();
  renderPipeline();
  renderInsights();
}

function renderNavigation() {
  const titles = { workspace: "全流程工作台", resources: "服装资源整合库", pipeline: "打样、生产与质检协同", insights: "销售反馈与复盘看板" };
  dom.viewTitle.textContent = titles[activeView];
  dom.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === activeView));
  Object.entries(dom.views).forEach(([key, view]) => view.classList.toggle("view-active", key === activeView));
}

function renderMetrics() {
  const resourceCount = activeProject ? activeProject.matchedResources.length : resources.length;
  dom.metrics.stage.textContent = stages.length;
  dom.metrics.resources.textContent = resourceCount;
  dom.metrics.leadTime.textContent = activeProject ? `${activeProject.estimatedLeadTime} 天` : "0 天";
  dom.metrics.status.textContent = activeProject ? `${activeProject.readiness}%` : "待生成";
}

function renderStageTabs() {
  dom.stageTabs.innerHTML = stages.map((stage) => `<button class="stage-tab${stage.id === activeStage ? " active" : ""}" data-stage="${stage.id}"><span>${stage.short} / ${escapeHtml(stage.owner)}</span><strong>${escapeHtml(stage.title)}</strong></button>`).join("");
}

function renderStageContent() {
  if (!activeProject) {
    dom.projectName.textContent = "等待生成项目";
    dom.projectStatus.textContent = "Brief 未完成";
    dom.projectStatus.classList.remove("ready");
    dom.stageContent.innerHTML = `<div class="empty-state"><div><strong>填写左侧项目 Brief 后生成完整开发链路</strong><br />市场机会、款式、材料、技术包、打样、生产、质检和销售复盘会自动组合成一个可落地项目。</div></div>`;
    return;
  }
  dom.projectName.textContent = activeProject.name;
  dom.projectStatus.textContent = "生产资料包已生成";
  dom.projectStatus.classList.add("ready");
  const stage = activeProject.stages[activeStage];
  const renderers = { opportunity: renderOpportunity, design: renderDesign, materials: renderMaterials, techpack: renderTechpack, sampling: renderSampling, production: renderProduction, quality: renderQuality, sales: renderSales };
  dom.stageContent.innerHTML = renderers[activeStage](stage);
}

function renderOpportunity(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4><p>${escapeHtml(stage.summary)}</p></article><article class="detail-block"><h4>交付物</h4><div class="tag-row"><span class="tag">${escapeHtml(stage.deliverable)}</span></div></article><article class="detail-block"><h4>机会信号</h4>${list(stage.signals, "bullet-list")}</article><article class="detail-block"><h4>开发风险</h4><div class="tag-row">${stage.risks.map((risk) => `<span class="risk-pill">${escapeHtml(risk)}</span>`).join("")}</div></article></div>`;
}

function renderDesign(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4><p>${escapeHtml(stage.summary)}</p></article><article class="detail-block"><h4>色彩方向</h4><div class="palette-row">${stage.palette.map(([name, color]) => `<span class="swatch"><span style="background:${color}"></span><span>${escapeHtml(name)}</span></span>`).join("")}</div></article><article class="detail-block"><h4>版型策略</h4>${list(stage.silhouette, "bullet-list")}</article><article class="detail-block"><h4>AI 图像提示词</h4>${list(stage.prompts, "compact-list")}</article></div>`;
}

function renderMaterials(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4>${table(["类别", "资源", "用量", "报价", "交期"], stage.bom)}</article><article class="detail-block"><h4>推荐资源</h4>${list([...stage.fabrics, ...stage.trims].map((item) => `${item.name}：${item.note}`), "bullet-list")}</article><article class="detail-block"><h4>替代与控险</h4>${list(stage.alternatives, "check-list")}</article></div>`;
}

function renderTechpack(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4>${table(["字段", "内容"], stage.specs)}</article><article class="detail-block"><h4>尺寸基准</h4>${table(["部位", "规格", "公差"], stage.measurements)}</article><article class="detail-block"><h4>工艺与包装</h4>${list(stage.workmanship, "check-list")}</article></div>`;
}

function renderSampling(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4>${list(stage.steps, "check-list")}</article><article class="detail-block"><h4>协作角色</h4><div class="tag-row">${stage.owners.map((owner) => `<span class="tag">${escapeHtml(owner)}</span>`).join("")}</div></article></div>`;
}

function renderProduction(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4>${table(["项目", "估算"], stage.cost)}</article><article class="detail-block"><h4>推荐工厂</h4>${list(stage.factories.map((item) => `${item.name}：${item.note}`), "bullet-list")}</article><article class="detail-block"><h4>产前风险</h4>${list(stage.risks, "check-list")}</article></div>`;
}

function renderQuality(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4><p>${escapeHtml(stage.partner.name)}：${escapeHtml(stage.partner.note)}</p></article><article class="detail-block"><h4>质检清单</h4>${list(stage.checklist, "check-list")}</article></div>`;
}

function renderSales(stage) {
  return `<div class="content-grid"><article class="detail-block"><h4>${escapeHtml(stage.headline)}</h4>${list(stage.copy, "bullet-list")}</article><article class="detail-block"><h4>销售素材</h4>${list(stage.assets, "check-list")}</article><article class="detail-block"><h4>复盘指标</h4>${renderBars(stage.metrics)}</article></div>`;
}

function renderResources() {
  const filters = ["全部", ...new Set(resources.map((resource) => resource.type))];
  dom.resourceFilters.innerHTML = filters.map((filter) => `<button class="filter-button${filter === activeFilter ? " active" : ""}" data-filter="${escapeHtml(filter)}">${escapeHtml(filter)}</button>`).join("");
  const visible = activeFilter === "全部" ? resources : resources.filter((resource) => resource.type === activeFilter);
  dom.resourceGrid.innerHTML = visible.map(renderResourceCard).join("");
}

function renderResourceCard(resource) {
  return `<article class="resource-card"><header><div><span class="eyebrow">${escapeHtml(resource.type)}</span><h4>${escapeHtml(resource.name)}</h4></div><span class="status-pill ready">${resource.score}</span></header><p>${escapeHtml(resource.note)}</p><div class="resource-meta"><span><b>报价</b>${escapeHtml(resource.price)}</span><span><b>起订</b>${escapeHtml(resource.moq)}</span><span><b>交期</b>${escapeHtml(resource.leadTime)}</span><span><b>区域</b>${escapeHtml(resource.region)}</span></div><div class="tag-row">${resource.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div></article>`;
}

function renderPipeline() {
  const timeline = activeProject ? activeProject.stages.production.timeline : buildTimeline(defaultBrief, 23);
  dom.pipelineTimeline.innerHTML = timeline.map((item) => `<article class="timeline-item"><time>${escapeHtml(item.day)}</time><div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.text)}</p></div><span class="status-pill ready">可协同</span></article>`).join("");
}

function renderInsights() {
  const sales = activeProject ? activeProject.stages.sales : generateProject(defaultBrief).stages.sales;
  dom.insightLayout.innerHTML = `<article class="insight-card"><h4>市场验证指标</h4>${renderBars(sales.metrics)}</article><article class="insight-card"><h4>返单建议</h4>${list(["优先观察尺码退换、面料手感评价和内容互动关键词。", "当预售转化和返单信心同时超过 70%，建议进入第二批补货。", "将差评原因回流到版型、BOM 和质检环节，形成下一轮开发输入。"], "check-list")}</article>`;
}

function list(items, className) {
  if (!items.length) return `<p>暂无匹配数据。</p>`;
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function table(headers, rows) {
  return `<table class="data-table"><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function renderBars(metrics) {
  return `<div class="bar-list">${metrics.map(([label, value]) => `<div class="bar-row"><span><b>${escapeHtml(label)}</b><b>${escapeHtml(value)}%</b></span><div><i style="width:${Number(value)}%"></i></div></div>`).join("")}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[char]);
}

function switchView(view) {
  activeView = view;
  renderNavigation();
}

function exportProject() {
  const project = activeProject || generateProject(readBrief(dom.form));
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${project.name.replace(/\s+/g, "-")}-开发包.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function loadDemo() {
  Object.entries(defaultBrief).forEach(([key, value]) => {
    const field = dom.form.elements[key];
    if (field) field.value = value;
  });
  activeProject = generateProject(defaultBrief);
  activeStage = "opportunity";
  render();
}

dom.form.addEventListener("submit", (event) => {
  event.preventDefault();
  activeProject = generateProject(readBrief(dom.form));
  activeStage = "opportunity";
  render();
});

dom.navItems.forEach((item) => item.addEventListener("click", () => switchView(item.dataset.view)));

dom.stageTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stage]");
  if (!button) return;
  activeStage = button.dataset.stage;
  renderStageTabs();
  renderStageContent();
});

dom.resourceFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  renderResources();
});

dom.loadDemoButton.addEventListener("click", loadDemo);
dom.exportButton.addEventListener("click", exportProject);

const saved = window.localStorage.getItem("ai-fashion-creator-project");
if (saved) {
  try {
    activeProject = JSON.parse(saved);
  } catch {
    activeProject = null;
  }
}

window.addEventListener("beforeunload", () => {
  if (activeProject) window.localStorage.setItem("ai-fashion-creator-project", JSON.stringify(activeProject));
});

render();
