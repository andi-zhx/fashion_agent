from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "4173"))

STAGES = [
    {"id": "market", "name": "市场机会", "owner": "趋势策略"},
    {"id": "design", "name": "AI 款式", "owner": "设计生成"},
    {"id": "materials", "name": "面辅料", "owner": "资源匹配"},
    {"id": "techpack", "name": "技术包", "owner": "产品开发"},
    {"id": "sample", "name": "打样", "owner": "版师样衣"},
    {"id": "production", "name": "生产质检", "owner": "供应链"},
    {"id": "commerce", "name": "上架复盘", "owner": "销售转化"},
]

RESOURCE_CATALOG = [
    {
        "kind": "面料",
        "name": "抗皱 TR 斜纹混纺",
        "tags": ["通勤", "外套", "垂感", "现货"],
        "region": "长三角",
        "cost": "28-36 元/米",
        "moq": "80 米",
        "lead_time": "3-5 天",
        "quality": 94,
        "note": "适合利落廓形、通勤外套和中高频穿着，量产稳定性好。",
    },
    {
        "kind": "面料",
        "name": "再生尼龙防泼水布",
        "tags": ["机能", "夹克", "跨境", "防泼水"],
        "region": "珠三角",
        "cost": "34-48 元/米",
        "moq": "100 米",
        "lead_time": "5-7 天",
        "quality": 91,
        "note": "适合城市机能、户外夹克、跨境平台和轻量化单品。",
    },
    {
        "kind": "面料",
        "name": "亲肤棉羊毛针织",
        "tags": ["针织", "亲肤", "秋冬", "套装"],
        "region": "成渝",
        "cost": "42-58 元/公斤",
        "moq": "60 公斤",
        "lead_time": "7-10 天",
        "quality": 88,
        "note": "适合温暖、柔软、低刺激的针织单品，小单测试友好。",
    },
    {
        "kind": "辅料",
        "name": "哑光树脂扣与金属暗扣组合",
        "tags": ["纽扣", "通勤", "外套", "极简"],
        "region": "长三角",
        "cost": "0.28-1.8 元/件",
        "moq": "500 件",
        "lead_time": "2-4 天",
        "quality": 89,
        "note": "适合极简与轻商务风格，色差稳定，补货速度快。",
    },
    {
        "kind": "辅料",
        "name": "顺滑耐磨功能拉链",
        "tags": ["拉链", "机能", "夹克", "耐磨"],
        "region": "珠三角",
        "cost": "3.8-7.5 元/条",
        "moq": "100 条",
        "lead_time": "4-6 天",
        "quality": 92,
        "note": "适合外套、机能口袋和可拆卸结构，耐用性和手感更稳定。",
    },
    {
        "kind": "工厂",
        "name": "杭州女装小单快反工坊",
        "tags": ["打样", "女装", "通勤", "快反"],
        "region": "长三角",
        "cost": "样衣 650-1500 元/件",
        "moq": "50 件",
        "lead_time": "7-12 天",
        "quality": 93,
        "note": "擅长女装版型、样衣修改、通勤类产品和中小批量快反。",
    },
    {
        "kind": "工厂",
        "name": "广州跨境柔性生产工厂",
        "tags": ["跨境", "连衣裙", "上衣", "包装"],
        "region": "珠三角",
        "cost": "加工费 38-120 元/件",
        "moq": "80 件",
        "lead_time": "10-18 天",
        "quality": 90,
        "note": "熟悉 TikTok Shop、独立站、跨境包装和短周期返单。",
    },
    {
        "kind": "质检",
        "name": "第三方成衣与面辅料检测",
        "tags": ["质检", "面辅料", "成衣", "抽检"],
        "region": "全国",
        "cost": "按项目报价",
        "moq": "按批次",
        "lead_time": "2-5 天",
        "quality": 96,
        "note": "覆盖成分、色牢度、缩水率、尺寸、外观、包装和出货前抽检。",
    },
]


def load_model_config() -> dict[str, Any]:
    config = {
        "enabled": False,
        "provider": "openai-compatible",
        "base_url": os.environ.get("FASHION_AI_BASE_URL", "").strip(),
        "model": os.environ.get("FASHION_AI_MODEL", "").strip(),
        "api_key_env": "FASHION_AI_API_KEY",
        "timeout": 30,
    }

    local_config = ROOT / "config.local.json"
    if local_config.exists():
        with local_config.open("r", encoding="utf-8") as file:
            config.update(json.load(file))

    api_key = os.environ.get(config.get("api_key_env") or "FASHION_AI_API_KEY", "").strip()
    config["configured"] = bool(config.get("enabled") and config.get("base_url") and config.get("model") and api_key)
    config["api_key_present"] = bool(api_key)
    return config


def score_resource(resource: dict[str, Any], brief: dict[str, Any]) -> int:
    keywords = " ".join(
        [
            brief.get("category", ""),
            brief.get("style", ""),
            brief.get("audience", ""),
            brief.get("channel", ""),
            brief.get("season", ""),
            brief.get("idea", ""),
        ]
    )
    score = int(resource["quality"]) - 18
    for tag in resource["tags"]:
        if tag in keywords:
            score += 12
    if brief.get("region", "") in resource.get("region", "") or resource.get("region") == "全国":
        score += 10
    return min(score, 99)


def match_resources(brief: dict[str, Any]) -> list[dict[str, Any]]:
    matched = []
    for resource in RESOURCE_CATALOG:
        item = dict(resource)
        item["match_score"] = score_resource(resource, brief)
        if item["match_score"] >= 70 or item["kind"] in ["质检", "工厂"]:
            matched.append(item)
    return sorted(matched, key=lambda item: item["match_score"], reverse=True)[:8]


def build_measurements(category: str) -> list[list[str]]:
    if "外套" in category or "夹克" in category:
        return [
            ["肩宽", "S 39 / M 40.5 / L 42", "±1.0 cm"],
            ["胸围", "S 104 / M 108 / L 112", "±1.5 cm"],
            ["衣长", "S 62 / M 64 / L 66", "±1.0 cm"],
            ["袖长", "S 58 / M 59.5 / L 61", "±1.0 cm"],
        ]
    if "连衣裙" in category:
        return [
            ["胸围", "S 88 / M 92 / L 96", "±1.0 cm"],
            ["腰围", "S 70 / M 74 / L 78", "±1.0 cm"],
            ["裙长", "S 112 / M 114 / L 116", "±1.5 cm"],
            ["下摆", "S 168 / M 172 / L 176", "±2.0 cm"],
        ]
    return [
        ["肩宽", "S 38 / M 40 / L 42", "±1.0 cm"],
        ["胸围", "S 92 / M 96 / L 100", "±1.0 cm"],
        ["衣长", "S 54 / M 56 / L 58", "±1.0 cm"],
        ["袖长", "S 20 / M 21 / L 22", "±0.8 cm"],
    ]


def estimate_unit_cost(brief: dict[str, Any]) -> int:
    category = brief.get("category", "")
    style = brief.get("style", "")
    quantity = int(brief.get("quantity") or 120)
    base = 128 if ("外套" in category or "夹克" in category) else 76
    style_cost = 22 if "机能" in style else 14 if "派对" in style else 10
    discount = -12 if quantity >= 300 else -6 if quantity >= 120 else 0
    return base + style_cost + discount


def build_plan(brief: dict[str, Any]) -> dict[str, Any]:
    matched = match_resources(brief)
    category = brief.get("category", "通勤外套")
    audience = brief.get("audience", "新锐服装创作者")
    style = brief.get("style", "轻商务极简")
    channel = brief.get("channel", "内容种草与预售")
    season = brief.get("season", "秋冬")
    quantity = int(brief.get("quantity") or 120)
    unit_cost = estimate_unit_cost(brief)
    lead_time = 34 if quantity >= 300 else 27 if quantity >= 160 else 21
    project_name = f"{style} {category}"

    fabrics = [item for item in matched if item["kind"] == "面料"][:2]
    trims = [item for item in matched if item["kind"] == "辅料"][:2]
    factories = [item for item in matched if item["kind"] == "工厂"][:2]
    qc = next((item for item in matched if item["kind"] == "质检"), RESOURCE_CATALOG[-1])

    bom = [
        ["主面料", fabrics[0]["name"] if fabrics else "待匹配主面料", "1.8-2.4 米/件", fabrics[0]["cost"] if fabrics else "待报价"],
        ["替代面料", fabrics[1]["name"] if len(fabrics) > 1 else "同手感同克重备选料", "同克重/相近手感", fabrics[1]["cost"] if len(fabrics) > 1 else "待报价"],
        ["辅料", trims[0]["name"] if trims else "纽扣/拉链/洗标/吊牌", "按结构确认", trims[0]["cost"] if trims else "待报价"],
        ["包装", "吊牌、洗标、尺码贴、OPP 袋", "1 套/件", "1.2-3.5 元/件"],
        ["质检", qc["name"], f"{quantity} 件批次", qc["cost"]],
    ]

    return {
        "id": f"AFC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "name": project_name,
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "engine": "rules",
        "brief": brief,
        "summary": {
            "positioning": f"面向 {audience} 的 {season} {category}，通过 {channel} 做小单验证。",
            "readiness": min(96, 72 + len(matched) * 3),
            "lead_time": f"{lead_time} 天",
            "unit_cost": f"{unit_cost} 元",
            "pilot_quantity": f"{quantity} 件",
            "risk_level": "中低" if len(matched) >= 5 else "中",
        },
        "pipeline": [
            {"stage": "市场机会", "output": "目标用户、场景、价格带、试产策略", "status": "已生成"},
            {"stage": "AI 款式", "output": "款式方向、颜色、图像提示词、平面图需求", "status": "已生成"},
            {"stage": "面辅料", "output": "BOM、替代料、起订量、交期和成本", "status": "已匹配"},
            {"stage": "技术包", "output": "尺寸表、工艺说明、包装和质检要求", "status": "可导出"},
            {"stage": "打样生产", "output": "样衣单、修改记录、小单排期", "status": "待协同"},
            {"stage": "质检交付", "output": "检测计划、抽检清单、报告入口", "status": "待下单"},
            {"stage": "销售复盘", "output": "上架文案、短视频脚本、返单指标", "status": "待验证"},
        ],
        "sections": {
            "market": {
                "title": "市场机会判断",
                "body": [
                    f"{channel} 更适合用内容种草、预售或小批量试销验证 {category}，避免一开始重库存。",
                    f"{audience} 需要清晰的场景价值：好穿、上镜、价格合理，并且能被快速复购或返单。",
                    f"{season} 开发需要提前锁定主面料、替代面料和包装标准，降低打样后缺料风险。",
                ],
                "risks": ["个人审美替代市场判断", "样衣反复修改拉长周期", "尺码分布不清导致库存偏差"],
            },
            "design": {
                "title": "AI 款式设计方向",
                "body": [
                    brief.get("idea") or "围绕目标场景生成兼顾上身效果、成本和量产稳定性的款式。",
                    "首版设计建议保留一个强记忆点，避免复杂结构在打样阶段放大成本。",
                    "先做 2 个主色和 1 个限定色，把颜色库存风险控制在可复盘范围内。",
                ],
                "prompts": [
                    f"commercial fashion design, {category}, {style}, target customer {audience}, production ready garment",
                    f"technical flat sketch, front and back view, {category}, clean seam lines, fabric texture, trims placement",
                    f"lookbook photo, {style}, {channel}, wearable styling, real product detail, ecommerce ready",
                ],
            },
            "materials": {"title": "面辅料和资源匹配", "bom": bom, "resources": matched},
            "techpack": {
                "title": "可生产技术包",
                "specs": [
                    ["产品名", project_name],
                    ["目标客群", audience],
                    ["渠道", channel],
                    ["价格带", brief.get("price_tier", "399-699 元")],
                    ["试产数量", f"{quantity} 件"],
                    ["生产区域", brief.get("region", "长三角")],
                ],
                "measurements": build_measurements(category),
                "workmanship": ["明确缝份、止口、压线宽度和关键部位公差。", "确认样衣后再进行尺码放码和产前样。", "包装包含洗标、吊牌、尺码贴、条码和外箱唛头。"],
            },
            "sample": {"title": "打样协同", "body": ["D1-D2 确认款式、BOM、目标成本和尺寸基准。", "D3-D8 版师建版，样衣工厂制作首版样衣。", "D9-D14 记录穿着、尺寸、面料和工艺修改点。", "二版样只处理关键修改，避免无限扩散需求。"]},
            "production": {"title": "生产与质检", "factories": factories, "quality": ["面辅料检测：成分、色牢度、缩水率、克重。", "成衣检测：尺寸、公差、缝制、线头、外观。", "包装检测：吊牌、洗标、尺码贴、外箱和运输标识。", "出货前按批次抽检并形成可追溯报告。"]},
            "commerce": {
                "title": "销售素材与复盘",
                "copy": [f"{project_name}，为 {audience} 设计，兼顾真实穿着、镜头表现和小单快反品质。", f"首批 {quantity} 件试产，适合通过 {channel} 做预售、试穿反馈和返单验证。"],
                "metrics": [["内容互动", 78], ["预售转化", 64], ["尺码反馈", 82], ["返单信心", 71]],
            },
        },
    }


def extract_json(text: str) -> dict[str, Any] | None:
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


def call_model(brief: dict[str, Any], base_plan: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    if not config.get("configured"):
        return {"enabled": False, "status": "not_configured", "message": "未配置大模型，当前使用本地规则引擎。"}

    api_key = os.environ.get(config.get("api_key_env") or "FASHION_AI_API_KEY", "")
    prompt = {
        "role": "system",
        "content": "你是资深服装商品开发总监。请基于用户 brief 输出更专业的产品开发建议，返回 JSON，字段包含 opportunities, design_notes, supply_chain_notes, quality_notes, launch_notes。",
    }
    user_message = {"role": "user", "content": json.dumps({"brief": brief, "base_plan": base_plan}, ensure_ascii=False)}
    payload = {"model": config["model"], "messages": [prompt, user_message], "temperature": 0.35}
    request = urllib.request.Request(
        config["base_url"],
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=int(config.get("timeout", 30))) as response:
            raw = json.loads(response.read().decode("utf-8"))
        content = raw.get("choices", [{}])[0].get("message", {}).get("content", "")
        parsed = extract_json(content)
        return {"enabled": True, "status": "ok", "raw": content, "parsed": parsed}
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, KeyError, json.JSONDecodeError) as error:
        return {"enabled": True, "status": "error", "message": str(error)}


def send_json(handler: BaseHTTPRequestHandler, payload: Any, status: int = 200) -> None:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


class FashionHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path == "/api/status":
            config = load_model_config()
            public = {key: config.get(key) for key in ["enabled", "provider", "base_url", "model", "api_key_env", "configured", "api_key_present"]}
            send_json(self, {"stages": STAGES, "model": public})
            return

        if self.path == "/api/resources":
            send_json(self, {"resources": RESOURCE_CATALOG})
            return

        self.serve_static()

    def do_POST(self) -> None:
        if self.path != "/api/generate":
            send_json(self, {"error": "Not found"}, 404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            brief = payload.get("brief", payload)
            use_model = bool(payload.get("use_model"))
            plan = build_plan(brief)
            config = load_model_config()
            if use_model:
                model_result = call_model(brief, plan, config)
                plan["model"] = model_result
                if model_result.get("parsed"):
                    plan["ai_enhancement"] = model_result["parsed"]
                    plan["engine"] = "rules+model"
            else:
                plan["model"] = {"enabled": False, "status": "skipped", "message": "未请求大模型增强。"}
            send_json(self, plan)
        except Exception as error:
            send_json(self, {"error": str(error)}, 500)

    def serve_static(self) -> None:
        path = self.path.split("?", 1)[0]
        if path == "/":
            path = "/index.html"
        file_path = (ROOT / path.lstrip("/")).resolve()
        if ROOT not in file_path.parents and file_path != ROOT:
            self.send_error(403)
            return
        if not file_path.exists() or file_path.is_dir():
            self.send_error(404)
            return
        content_type = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
        }.get(file_path.suffix, "application/octet-stream")
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[AFC] {self.address_string()} {format % args}")


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", PORT), FashionHandler)
    print(f"AI Fashion Creator running at http://localhost:{PORT}")
    print("Optional model config: copy config.example.json to config.local.json and set FASHION_AI_API_KEY.")
    server.serve_forever()


if __name__ == "__main__":
    main()
