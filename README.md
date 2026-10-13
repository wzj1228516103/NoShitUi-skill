# NoShitUi-skill

简体中文 · Open-source UI discovery and implementation skill

> 一个 Skill，多种 UI 方向：先从开源库、组件和设计参考中做出有依据的选择，再用最小可验证实现把视觉方向落地。

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![HTML](https://img.shields.io/badge/demo-HTML%20%2B%20CSS%20%2B%20SVG-orange.svg)](ui-atlas-demo/showcase.html)
[![Skill](https://img.shields.io/badge/Codex-Skill-2563EB.svg)](SKILL.md)

## 这个项目有什么

NoShitUi-skill 面向需要做网页、产品界面或设计探索的任务，覆盖三类工作：

- **发现**：按用途整理开源 UI 库、组件、模板、图标和设计参考网站。
- **选型**：根据框架、可访问性、主题能力、运行时、许可证和维护状态，收敛成一套主方案。
- **落地**：在已有项目中保持现有约定，只实现一个最小、可验证的代表性页面或组件。

Skill 入口在根目录的 [`SKILL.md`](SKILL.md)，详细目录与选型参考在 [`open-source-ui-resources/`](open-source-ui-resources/)。

## 四个完全不同的概念网站

下面的演示页没有共用一套视觉皮肤。每个页面都有自己的字体、色彩、间距、信息密度和交互节奏，用来展示“同一个 UI Skill 可以支持多种设计方向”。

| 概念 | 方向 | 代表交互 |
| --- | --- | --- |
| [FORME](ui-atlas-demo/editorial.html) | 建筑与生活杂志；衬线字体、编辑部版式、图片叙事 | 阅读文章、按 Spaces / Objects / People 筛选 |
| [OFFGRID](ui-atlas-demo/studio.html) | 粗野主义创意工作室；海报字、酸性绿、大动作 | 项目筛选、项目详情、联系弹窗 |
| [rooted.](ui-atlas-demo/botanical.html) | 温暖植物商店；植物插画、养护信息、轻购物流 | 植物分类、加入购物袋、数量调整、本地存储 |
| [ORBITAL](ui-atlas-demo/mission.html) | 深色任务控制台；轨道图、遥测、系统状态 | 暂停模拟、切换飞船、网格/地球开关、CSV 导出 |

入口页：[UI Atlas — Four visual directions](ui-atlas-demo/showcase.html)

## 项目素材

桌面与移动端截图来自本地浏览器回归，放在 [`docs/screenshots/concepts/`](docs/screenshots/concepts/)。

![FORME editorial concept](docs/screenshots/concepts/editorial-desktop.png)

![OFFGRID studio concept](docs/screenshots/concepts/studio-desktop.png)

![rooted botanical shop concept](docs/screenshots/concepts/botanical-desktop.png)

![ORBITAL mission control concept](docs/screenshots/concepts/mission-desktop.png)

移动端素材包括 `showcase-mobile.png`、`editorial-mobile.png`、`studio-mobile.png`、`botanical-mobile.png` 和 `mission-mobile.png`。

## 本地运行

项目是无构建依赖的静态演示，使用 Node.js 启动本地服务即可：

```powershell
node -e "require('http').createServer((req,res)=>{const fs=require('fs');const path=require('path');const file=path.join(process.cwd(),decodeURIComponent(req.url.split('?')[0]||'/index.html'));const target=fs.existsSync(file)&&fs.statSync(file).isFile()?file:path.join(process.cwd(),'ui-atlas-demo','showcase.html');const ext=path.extname(target);const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};res.setHeader('Content-Type',types[ext]||'text/plain; charset=utf-8');fs.createReadStream(target).pipe(res)}).listen(4173,()=>console.log('http://localhost:4173/ui-atlas-demo/showcase.html'))"
```

然后打开：<http://localhost:4173/ui-atlas-demo/showcase.html>

如果只想快速预览，也可以直接打开 [`ui-atlas-demo/showcase.html`](ui-atlas-demo/showcase.html)。

## 安装 Skill

将仓库作为 Codex Skill 安装：

```bash
npx skills add https://github.com/wzj1228516103/NoShitUi-skill -g -a codex -y
npx skills list -g -a codex
```

安装后重新打开 Codex，在任务里直接说清楚目标，或显式使用 `$noshit-ui-skill`。

示例：

```text
帮我为这个 React 管理后台比较 MUI、Mantine 和 shadcn/ui，考虑 SSR、可访问性、包体积和主题定制，最后实现一个代表性表格页。
```

## 目录

```text
.
├─ SKILL.md                              # 可直接安装的根级 Skill 入口
├─ agents/openai.yaml                    # Codex 界面元数据
├─ open-source-ui-resources/
│  ├─ SKILL.md                           # 详细资源目录 Skill
│  ├─ references/ui-libraries.md         # 按框架和用途整理的 UI 库
│  ├─ references/ui-websites.md          # 灵感、组件和模式网站
│  ├─ references/selection-and-adoption.md
│  └─ scripts/check_catalog.py           # 本地引用与可选链接检查
├─ ui-atlas-demo/                        # 四个独立概念网站
└─ docs/screenshots/concepts/            # 桌面/移动端素材
```

## 目录内容和选型原则

当前目录涵盖 React、Vue、Svelte、CSS-first、图标和数据可视化方向，例如 MUI、Ant Design、Mantine、shadcn/ui、Radix UI、React Aria、Element Plus、Vuetify、Skeleton、Bootstrap、Tailwind CSS、Lucide、Heroicons 和 Apache ECharts。

目录也收录 Mobbin、Page Flows、Godly、Awwwards、UIverse、HyperUI、Component Gallery 等网站，但会明确区分“灵感参考”和“可复用代码”。“免费”“可复制”“MIT”和“开源”不是同一个承诺，使用前仍需核对官方仓库、具体组件和第三方素材的当前条款。

## 验证

目录检查：

```bash
python open-source-ui-resources/scripts/check_catalog.py
```

本次演示已在桌面和 `390×844` 移动视口检查页面没有横向溢出，且回归了文章阅读、项目筛选、购物袋、模拟暂停、飞船切换和 CSV 下载等交互。页面中的遥测、联系方式和商品数据均为演示数据。

## 技术栈

- 原生 HTML、CSS、SVG、JavaScript，无前端构建依赖。
- Google Fonts：DM Sans、DM Serif Display、Italiana、Space Grotesk、Anton、IBM Plex Mono。
- Unsplash 远程图片，仅用于概念演示。
- `dialog`、`localStorage`、Blob 下载和响应式 CSS 用于展示真实交互状态。

## 许可证与素材说明

本仓库原创文件采用 [MIT License](LICENSE)。演示页是原创概念实现，没有把目录中的第三方 UI 库代码直接复制进页面。远程图片、字体和目录链接中的项目各自遵循其当前许可证或网站条款，详见 [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md)。

如果你要把某个资源用于生产项目，请保留来源记录，确认版本、依赖、许可证、归属要求和可访问性行为，再进行集成。

