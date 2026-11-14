# 站内链接审计（2026-11-14）

审计对象是仓库 `wherexml/image-aspect-ratio` 的 `main`（`0697515`）和同日公开站点 https://imageaspectratio.com/ 。没有连接 Search Console，下文没有任何访问量、排名或“做了就会上涨”的说法。开放 PR 检查结果为空，本批不与现有 PR 重叠。

## 线上已核对的 URL

2026-11-14 直接请求（不跟随重定向时记录状态码）：

| URL | 结果 |
| --- | --- |
| `/`、`/calculator`、`/social-media`、`/video-aspect-ratio`、`/ultrawide-aspect-ratio-calculator`、`/what-is-aspect-ratio`、`/exact-fractions-vs-rounded-pixels`、五条社交详情、`/about`、`/contact`、`/privacy`、`/terms`、`/make-image-square` | 200，各自 canonical 为去掉查询的 HTTPS 路径 |
| `/calculator?q=16` | 200；canonical 与 `og:url` 仍是 `https://imageaspectratio.com/calculator` |
| `/image-aspect-ratio` 与 `/image-aspect-ratio?x=1` | 308 到 `/` 与 `/?x=1` |
| `/calculator/`、`/what-is-aspect-ratio/`、`/make-image-square/` | 308 到无尾斜杠路径 |
| `http://imageaspectratio.com/`、`https://www.imageaspectratio.com/`、`http://www.imageaspectratio.com/calculator` | 308 到 `https://imageaspectratio.com` 对应路径 |
| `/robots.txt` | 200，`Allow: /`，并声明 sitemap；响应头 `X-Robots-Tag: noindex` |
| `/sitemap.xml` | 200，含上面 17 个 200 页面（含 `/make-image-square`），不含 `/image-aspect-ratio`；响应头 `noindex` |
| `/llms.txt` | 200 |
| `/no-such-page` | 404 |

首页与各工具页的 robots meta 为 `index, follow`。这是线上事实，不是本仓库预览的默认值。本地 Vite 预览仍发送 `noindex, nofollow`。

## 已证实的缺口（仓库与线上一致）

- 共享页脚的 Tools & guides 有首页、视频、超宽和两篇指南，没有 `/calculator`。About、Contact、Privacy、Terms 没有工具导航，因此这四个页面到手动计算器没有站内链接。计算器仍在工具页导航和 sitemap 里，不是孤儿页。
- 图片页预览 16:9 与 9:16，相关链接原先只到指南、计算器和视频页。
- 视频页模拟宽屏和竖屏，相关链接原先不到 YouTube 16:9 页或社交尺寸枢纽。
- 计算器 “Which aspect ratio should I choose?” 里，比例选择仍是按钮；只有超宽一项是链接。
- `/what-is-aspect-ratio` 的常见比例一节只链到超宽计算器。正文 JSON 未改。
- 五条社交详情页讨论 Fit/裁切取舍，相关链接原先不到指南的 `#crop-fit-stretch`。
- `/social-media` 正文只列出五个平台，没有链回图片检查或手动计算器。
- 仓库 `public/llms.txt` 已列各社交详情和指南，未列已在 sitemap 中的 `/social-media` 与 `/exact-fractions-vs-rounded-pixels`。

## 线上有、本仓库没有（本批不改）

- `https://imageaspectratio.com/make-image-square` 返回 200，标题为 “Make Image Square — Pad or Crop a Photo”。导航、页脚、sitemap 和线上 `llms.txt` 都包含它。页面可见文案包括 Crop、Pad、PNG/JPEG 和 Download image。当前 git 没有这条路由。本分支如果加上链接，仓库预览会 404。复制线上导出能力也超出低风险链接修复，并和仓库里“不导出、不裁切文件”的现有说明冲突。建议先把该页源码纳入 git，再决定页脚和 llms 怎么写。部署当前 `main` 本身就会让线上失去该页；本 PR 不部署。
- 线上社交菜单里有 “All platforms” → `/social-media`。仓库组件说明写明 2026-11-06 从菜单移除，枢纽仍由页脚进入。这是信息架构取舍，本批不把菜单项加回去。
- 线上 `/social-media` 另有 “Image sizes” 小节，YouTube 缩略图和 Instagram 帮助链接的可见文字是裸 URL。这段不在本仓库源码里，本批不能改它的锚文本。

## 本批改了什么

- 页脚 Tools & guides 增加 “Aspect ratio calculator”。页脚内部链接与 `SITE_PAGES` 一一对应。
- About 的 Tools and limits 给已描述的图片、计算器、视频、超宽和社交枢纽加上链接，并保留“不导出、不裁切、不转码”的原句。
- 图片页相关链接增加 “Widescreen 16:9 on YouTube”“Story 9:16 on social media”。视频页增加对应的 16:9 / 9:16 链接。计算器选择列表在原有超宽链接旁增加 YouTube 与社交枢纽，比例按钮仍是按钮。
- 指南常见比例一节在原有超宽链接外增加 YouTube 与社交枢纽，不改写已审阅段落。
- 社交详情 “Plan another format” 增加 “Fit, fill and stretch” → `/what-is-aspect-ratio#crop-fit-stretch`。
- 社交枢纽增加一句，链到图片检查器和手动计算器。
- `llms.txt` 补上上述两个已有页面。不写入 `/make-image-square`。

没有新路由、没有新长文、没有外链徽章、没有改计算、URL、分析或本地化行为。

## 延后的建议（不在本 PR 发布）

- 4:5 与 1:1 在本仓库没有独立页面。不为它们新建落地页。
- 精确分数对整像素一文已在仓库和线上发布。本轮不改正文，留给既有审阅，不另写新文章。
- 若要恢复社交菜单里的 “All platforms”，应单独决定，而不是顺手改导航。

## 测试

- `bun run test`：3 个文件、15 条通过。覆盖页脚与 `SITE_PAGES` 一致、sitemap 不含不存在的路由、llms 路径都属于已知页面，并渲染 About、首页、视频、计算器、超宽、指南、社交枢纽和 Instagram Story。
- `tsc --noEmit` 通过。改动文件的 eslint 通过。
- `bun run build` 通过。
- 本地 http://127.0.0.1:5173 点击：About 页脚 → `/calculator` → YouTube 链接 → `/youtube-aspect-ratio`；首页 “Story 9:16 on social media” → `/social-media` → “image aspect ratio checker” → `/`；Story 页 “Fit, fill and stretch” → `/what-is-aspect-ratio#crop-fit-stretch`。
- 390px 下页脚单列可点，计算器选择区 `scrollWidth` 等于内容宽度，没有横向溢出。

## 局限

Search Console 未连接。没有使用流量或排名数字。没有部署。没有对照线上 `/make-image-square` 的源码，因为 git 里没有它。没有抓取竞品站。
