# Bluebook Cover Generator

一个无需构建步骤、可直接在浏览器运行的中文蓝皮书封面生成工具。

## 功能

- 实时 SVG 封面预览
- 多种版式、模板、字体和装饰样式
- 自定义标题、系列名称、机构信息与 Logo
- 导出 PNG 和 SVG
- 网页右上角一键复制 Agent 提示词，让 Agent 自动安装 OpenCLI 插件与 skill 并生成本地 PNG

## 使用

直接打开 `index.html`，或访问线上版本：

https://bluebook-cover-generator.fhxqtech.com

## OpenCLI 调用

OpenCLI 插件通过 Browser Bridge 调用网页渲染 API，并将 PNG 直接写入本地。首版 CLI 只导出 PNG。

### 安装

要求 Node.js 20+、OpenCLI `>=1.7.22`，并已安装和连接 OpenCLI 浏览器扩展。

```bash
npm install -g @jackwener/opencli
opencli doctor

# 从本地仓库安装
opencli plugin install file:///absolute/path/to/bluebook-cover-generator/opencli-plugin

# 从 GitHub 安装本仓库中的子目录
opencli plugin install github:cnzhihao/bluebook-cover-generator/opencli-plugin

opencli bluebook-cover-generator --help
```

### 生成 PNG

```bash
opencli bluebook-cover-generator generate '人工智能产业发展蓝皮书' \
  --subtitle '2026 年趋势、案例与落地路径' \
  --englishTitle 'CHINA AI INDUSTRY DEVELOPMENT BLUE BOOK 2026' \
  --org '未来企业研究院' \
  --tags 'AI Agent, 企业应用, 产业趋势' \
  --template blueGold \
  --output ./蓝皮书封面.png \
  -f json
```

带 Logo、居中版式和 3× 导出：

```bash
opencli bluebook-cover-generator generate '绿色供应链研究报告' \
  --template green \
  --layout center \
  --logo ./brand/logo.png \
  --scale 3 \
  --output ./dist/绿色供应链研究报告.png \
  -f json
```

不指定 `--output` 时会覆盖当前目录下的 `蓝皮书封面.png`。默认倍率为 2×，输出尺寸为 `1600×2262`。

本地开发时启动静态服务器，并用环境变量切换插件访问地址：

```bash
python3 -m http.server 8000

BLUEBOOK_GENERATOR_URL=http://127.0.0.1:8000 \
  opencli bluebook-cover-generator generate '本地测试蓝皮书' -f json
```

## Agent Skill

仓库内的 [`skills/bluebook-cover-generator/SKILL.md`](skills/bluebook-cover-generator/SKILL.md) 指导 Agent 提炼报告封面文案、选择模板、调用 OpenCLI 并验证 PNG 已写入本地。

## License

[MIT](LICENSE)
