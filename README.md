# AI Fashion Creator OS

面向新锐服装创作者的一站式 AI 服装产品开发平台。当前版本改为轻量 Python 后端 + 网页前端，不需要安装重量级框架，适合先验证产品模式，再逐步接入真实大模型、数据库和供应链接口。

## 功能范围

- 服装产品 Brief 输入：品类、人群、风格、渠道、价格带、试产数量、季节、生产区域和创意描述。
- 一键生成全流程方案：市场机会、AI 款式方向、面辅料 BOM、技术包、打样计划、生产质检和销售复盘。
- 资源矩阵：内置面料、辅料、工厂和质检资源样例，并根据 Brief 做规则匹配。
- 技术包输出：生成可继续完善的规格表、尺寸表、工艺包装要求和 BOM 草案。
- 大模型接口预留：支持 OpenAI-compatible Chat Completions 风格接口，后期只需配置 API Key。
- JSON 导出：把当前项目方案导出，后续可接 PLM、ERP、供应商门户或数据库。

## 本地运行

不需要 pip 安装依赖，直接使用 Python 标准库：

```bash
python app.py
```

访问：

```text
http://localhost:4173
```

如果你习惯用 npm，也可以运行：

```bash
npm start
```

这个命令只是转发到 `python app.py`。

## 大模型配置

默认不启用大模型，系统使用本地规则引擎。后期接入自己的模型时：

1. 复制配置文件：

```bash
copy config.example.json config.local.json
```

2. 修改 `config.local.json`：

```json
{
  "enabled": true,
  "provider": "openai-compatible",
  "base_url": "https://your-model-provider.example.com/v1/chat/completions",
  "model": "your-model-name",
  "api_key_env": "FASHION_AI_API_KEY",
  "timeout": 30
}
```

3. 设置环境变量：

```bash
set FASHION_AI_API_KEY=你的API_KEY
```

4. 重新启动：

```bash
python app.py
```

页面里勾选“启用大模型增强”后，会在本地规则方案基础上调用模型接口。

## 项目结构

```text
.
├── app.py
├── config.example.json
├── index.html
├── package.json
├── server.js
├── src
│   ├── app.js
│   └── styles.css
└── docs
    └── product-spec.md
```

## 后续建议

- 把 `RESOURCE_CATALOG` 抽到数据库或后台管理页面。
- 增加项目保存、打样记录、样衣修改记录和质检报告上传。
- 接入图片生成模型，生成款式效果图、平面款式图和商品详情图。
- 增加账号与角色：创作者、商品开发、版师、工厂、质检机构。
