# Cloudflare deployment

## Unrecorded production releases reconciliation — 2026-11-06 to 2026-11-23 UTC

Verified against `wrangler deployments list --name aspect-ratio-canvas` and `wrangler versions list --name aspect-ratio-canvas`:

- **2026-11-06T16:38Z / 2026-11-07 CST (`afda3de`)**: Worker `68cc34e2-210a-496b-a7ed-1b57a0d9c876` (rollback `d6730cb2-d4f7-40ed-977f-302ac90970f2`). Swapped `/` to the image inspector, added `/calculator`, and set `/image-aspect-ratio` 308 redirect to `/`.
- **2026-11-07T02:31Z / 2026-11-07 CST (`0697515`)**: Worker `6e37dbda-ed35-4083-aba1-a28a30b70b7a` (rollback `68cc34e2-210a-496b-a7ed-1b57a0d9c876`). Refined image upload, paste, and persistent preview states.
- **2026-11-11T11:10Z (`9ab0cf51-2e2a-4222-932e-579d77ba3694`)**: TASK-9 and TASK-29 combined release (see section below).
- **2026-11-23T16:00Z / 2026-11-24 CST (`e50c93e`, bundling `a00e5cd`)**: Worker `23506678-350d-4570-82f6-fd918175e21e` (direct prior Cloudflare deployment `9ab0cf51-2e2a-4222-932e-579d77ba3694`, which predates the 8 new V3 routes). Shipped the 2026-11-22 V3 canonical root promotion (`a00e5cd`, 28 sitemap URLs — never separately uploaded or deployed to Cloudflare) together with the GEOInflow tool/engagement event bridge and `/_geo/api/send` allowlist (`e50c93e`; the first-party `/_geo/` relay predated `e50c93e`). Safe rollback target for the next release is `23506678-350d-4570-82f6-fd918175e21e`.

## TASK-9 and TASK-29 combined release — 2026-11-11

Released version: `9ab0cf51-2e2a-4222-932e-579d77ba3694` (100% traffic). Prior active and rollback version: `6e37dbda-ed35-4083-aba1-a28a30b70b7a`. The user explicitly authorized publishing both accepted candidates together and independently validating production. Live pages: [Make image square](https://imageaspectratio.com/make-image-square) and [Social image sizes](https://imageaspectratio.com/social-media#image-sizes).

This release includes the accepted compact Image/Social Media disclosures, exact current-page selection, Crop / Pad order and hand cursor, sharp image-preview corners, pointer-anchored Command/Control zoom, existing drag/export controls, four sourced image placements and the rotating source-disclosure chevron. The current source was verified against the latest accepted candidate; the older prepared November 11 release artifact was not used.

TypeScript, production build, Wrangler dry run, 11 local browser checks, 25 local HTTP checks and two independently decoded local downloads passed before upload. After deployment, 30 production browser checks, 25 HTTP checks, six alias/query redirects and 56 byte-matched public assets passed. Three real production downloads (Pad PNG, Crop PNG and Crop JPEG) decoded as 1080×1080 and matched independent source-geometry calculations with mean RGB errors below 3/255. Desktop/mobile and light/dark screenshots were inspected.

The existing Worker and Custom Domains, compatibility configuration, ASSETS binding and both GEO secret bindings were preserved. GA4 script configuration remains present; the GEO script returns the same bytes as before release. Production index/follow, canonical, sitemap and robots contracts passed; this is not proof of search index inclusion. No Git commit/push, branch/worktree or indexing submission was performed.

Evidence and repeatable checks: `../../reports/2026-11-11/task9-task29-release/README.md` from this document. The frozen deployed source/artifact, hashes, deployment record and exact rollback command are retained there. Earlier local/unreleased labels below describe their dated candidate stages; this record establishes the current combined production release.

## Image uploader release candidate — 2026-11-07

The user authorized committing and deploying the accepted Image uploader changes: native image paste, simplified uploader, always-visible pale placeholder previews, restored dimension layout and foreground frame borders. Existing production origin, indexability, routes and Worker bindings remain unchanged. Local build and browser evidence are retained in the parent workspace reports. Production acceptance is recorded separately after deployment.


## Source synchronization boundary — 2026-11-07

The current source includes the separate Image homepage and `/calculator` route described in [the product specification](product-spec.md). These latest changes are local and are not deployed by this synchronization. Earlier release/version entries below are dated historical observations, not a statement of today's active production version.

Before this push, the coordinating agent verified that fetched main matched local HEAD (0 ahead/0 behind), the GitHub Actions workflow count was zero, repository webhooks and deployment records were empty, and the old HEAD had no check runs. The local `.github/workflows` directory was also empty. This observation applies to that check time; verify again for future pushes. No deployment is authorized in this synchronization.

## Production configuration

- Canonical origin: `https://imageaspectratio.com`.
- Worker: `aspect-ratio-canvas`, with apex and `www.imageaspectratio.com` Custom Domains.
- Public build settings: `.env.production` sets `VITE_SITE_URL` and `VITE_SITE_INDEXABLE=true`. Development remains noindex by default.
- Nine pages share the production origin in canonical, Open Graph, JSON-LD and sitemap. `public/llms.txt` uses the same origin.
- The server redirects explicitly listed production aliases (www, legacy workers.dev, and HTTP apex) to HTTPS apex with status 308, preserving path and query. Local and unknown hosts are not redirected. Existing trailing-slash normalization and 404 handling remain active. Workers Assets serves static files directly.
- `scripts/prepare-worker.mjs` declares the Worker account, name, compatibility date and Custom Domains. The local `dev.host` prevents Wrangler from inferring a public upstream and producing a redirect loop.
- Previous TASK-24 version: `4bd3a58f-f084-4a50-bb99-eb0bdea6666b`, released on 2026-10-25 (Asia/Singapore) for TASK-24 social metadata and descriptions. Production HTTP and desktop Chrome checks passed. Previous active version observed immediately before release: `b1ddf8bc-da2b-434b-8a75-ade61310f27a`. Evidence: `verification/task24-release-20261025/`.
- Deployment is manual. GitHub CI/CD remains removed; pushing a commit does not deploy it.

## Mobile performance release — 2026-10-27

Current version: `17aba283-1729-4bd4-b791-d896ba20855e`. Rollback target before this optimization: `34a81e98-15d2-4a1e-bfcf-952f5dc1fc7a`. The user requested continued mobile optimization above 90 without changing functionality or styling. Framework-managed inline CSS, embedded UI font subsets with original-font fallback, unused utility exclusion and removal of unused QueryClient initialization are live. GA4/GEO timing and calculator behavior are preserved.

Final independent mobile PSI samples at 10:53 and 10:54 Asia/Singapore scored 95 and 93, with LCP 2.1 and 2.6 seconds; Accessibility/Best Practices/SEO remain 100. Typecheck/build, 16 production HTTP checks, 17 rendered checks, 38 byte-matched public build assets and live Chrome regression checks passed. The 390px homepage matches the pre-optimization screenshot pixel-for-pixel. All intermediate scores, cached-repeat exclusion, measurement limits and rollback details are in `verification/mobile-performance-20261027/README.md`. Maintenance: `docs/performance.md`. No Git commit or push was performed.

## Search appearance release — 2026-10-27

Released version: `34a81e98-15d2-4a1e-bfcf-952f5dc1fc7a`. Previous active and rollback version: `52e04172-c790-4ed2-b41f-f6b0d8ce19ad`. The user explicitly authorized publishing the accepted search appearance candidate and measuring mobile performance. Four supporting destinations, white favicon assets, free-first descriptions, matching breadcrumbs/schema, same-origin licensed fonts and mobile/contrast fixes are live. Existing integrations were preserved. No Git commit/push or indexing submission was performed.

Typecheck, build, 16 local and 16 production HTTP checks, 17 production rendered checks and 35 byte-matched public build assets passed. Chrome verified all four destinations, matching SPA metadata, exact calculations and the 390px layout. Google mobile PageSpeed at 10:33 Asia/Singapore measured Performance 75 (previous 70), LCP 4.4 s (previous 4.9 s), Accessibility/Best Practices/SEO 100. These are single lab samples, with no CrUX field data. Remaining first-render CSS/JS work and full evidence: `verification/search-release-20261027/README.md`.

## Aspect ratio guide release — 2026-10-27

Released version: `52e04172-c790-4ed2-b41f-f6b0d8ce19ad`. Previous active and rollback version: `17231890-7094-498b-9991-7ccb0a545957`. The user authorized publishing the accepted guide. `/what-is-aspect-ratio`, its internal links and nine-page sitemap are live. Existing analytics and GEOInflow integration were preserved. No commit or push was performed.

Typecheck, build, 16 local and 16 production HTTP checks passed. All 23 public assets matched the local build; `_headers` is deployment configuration and is not a served asset. Live Chrome verified the guide diagrams, table of contents, guide-to-calculator navigation, 1200 × 675 calculation, and return link. Search Console live inspection passed and visibly confirmed the indexing request; this is not proof of indexed inclusion or ranking. Evidence and repeatable steps: `verification/task28-release-20261027/README.md`.

## GEOInflow collection release — 2026-10-26

Released version: `17231890-7094-498b-9991-7ccb0a545957`. Prior production version before this integration: `6787add2-c514-4654-b13e-56b9cf995265`. The user authorized retaining the existing Worker and sending analytics through an existing VPS, without adding Cloudflare services.

Browser pageviews use `/_geo/script.js` and `/_geo/api/send` on the official website. The existing Tokyo VPS HTTPS host `llm.tothemars.top` accepts only authenticated `/_geoinflow/` relay requests, forwarded through a restricted SSH reverse connection to Zoppo. No new Cloudflare Tunnel, DNS record, Worker, log service or cloud resource was created for this path. Private Worker secrets `GEO_RELAY_KEY` and `GEO_SOURCE_TOKEN` must remain configured; neither belongs in source or VITE variables.

The server records best-effort HTML, sitemap and robots requests using `waitUntil`, a ten-second delivery bound and a source-specific token. Static assets served directly by Workers Assets are outside log coverage. Interruptions can lose logs; coverage is deliberately reported as incomplete, with no claim of exhaustive request accounting. GEOInflow's admin UI remains private at `geo.skylance.cc`.

Browser tracking respects Do Not Track, omits URL queries/fragments, skips explicit `analytics_test=1` sessions, and never sends images or calculator inputs. Browser automation tests are not organic growth. Public requests cannot choose another website ID or supply privileged IP/timestamp overrides. Original inbound Origin, content type and body size are checked.

Typecheck, build and 15 local/production HTTP checks passed. Native Chrome on Zoppo produced a homepage and SPA image-page visit; GEOInflow displayed two pageviews and one visitor. Server logs were processed by an active source. Unknown routes, missing Origin, wrong website IDs and oversized bodies were rejected with 404/403/400/413 respectively. Evidence: `../reports/2026-10-26/geoinflow-integration/`.

Rollback: restore the prior Worker version to stop both site integrations, then remove only the Tokyo nginx GEOINFLOW block and `zz-geoinflow-auth.conf` after validating nginx configuration, and unload Zoppo `cc.skylance.geoinflow-relay`. Do not restore whole historical nginx files over unrelated changes. Revoke only this source and relay credentials if retiring the integration.

## Tool analytics and image guide release — 2026-10-26

Released version: `6787add2-c514-4654-b13e-56b9cf995265`. Rollback version for that release: `0d7f3230-5ca9-44d3-9444-3470d5081ee6`. User authorized this release. The image page retains **Image Aspect Ratio Calculator**; the proposed Checker rename was withdrawn. The release adds the image guide and outcome analytics while preserving earlier deployed workspace changes.

Typecheck, production build and local HTTP acceptance passed. Production verification passed 15 HTTP checks, social metadata on eight pages, and byte comparisons for all 18 public assets. Chrome verified calculation, copy and local image decoding on the live site. GA4 property 560549779 DebugView received two `qa_tool_complete` events and one `qa_result_copy`; the image completion parameter `task_type=image_read` was inspected. These are internal test events, not evidence of organic traffic or indexing. No Git commit or push was performed for this release. Evidence and repeatable steps: `verification/tool-analytics-release-20261026/README.md`.

## Repository-link release — 2026-10-25

Version `0d7f3230-5ca9-44d3-9444-3470d5081ee6` updates the live repository URL to `https://github.com/wherexml/image-aspect-ratio`. Previous active version: `4b7b5e45-8b67-4580-a321-2eb14449f3d7`. The release was rebuilt from the existing production workspace, preserving earlier deployed changes that remain uncommitted. All eight pages matched the previous production HTML after normalizing the repository URL, generated asset hashes and per-request router timestamps. Typecheck, build, local/production HTTP and social metadata checks passed. Chrome verified calculator interaction and the Source, About and Contact links. Evidence and repeatable checks: `verification/repository-rename-release-20261025/README.md`.

## Build and verify from a clean checkout

Use the committed `bun.lock`; do not depend on an existing node_modules directory or private environment files. Verified toolchain: Bun 1.3.14 and Node.js 22.23.1.

```sh
bun install --frozen-lockfile
bunx tsc --noEmit
npm run build
node scripts/prepare-worker.mjs
npm run preview
# In another terminal:
python3 scripts/verify-http.py http://127.0.0.1:18767 https://imageaspectratio.com indexable
```

The production build is a TanStack Start SSR Worker with Static Assets. Do not upload only the static directory. Build settings contain no credentials. Use existing authorized Cloudflare credentials; never commit or log secrets.

Only after deployment authorization:

```sh
npm exec --yes --package=wrangler@4.151.1 -- wrangler deploy --config .output/server/wrangler.json
python3 scripts/verify-http.py https://imageaspectratio.com https://imageaspectratio.com indexable
```

Verify alias redirects, deep links, query preservation, assets and relevant browser workflows after publishing. The HTTP checker uses an explicit deployment-check User-Agent and a timeout. Keep security protections enabled.

DNS, certificates, Custom Domain bindings and Search Console verification are external account state. A Git clone reproduces application configuration, not ownership of these resources. The preparation script declares the domain routes; a new deployment still needs account permissions.

## IndexNow ownership and change notification

Released version `4b7b5e45-8b67-4580-a321-2eb14449f3d7` on 2026-10-25 adds the verification file. Previous active version: `4bd3a58f-f084-4a50-bb99-eb0bdea6666b`. Typecheck, build, local and production HTTP checks, and eight-page social metadata checks passed. Evidence is in the parent SEO workspace at `reports/2026-10-25/indexnow-performance/`.

The root text file in `public/` whose name matches its contents is the IndexNow ownership verification file configured in Ahrefs project 10584883. Keep it in subsequent builds; do not rotate or remove it independently of the Ahrefs setting. Verify its public URL returns 200 and the expected UTF-8 text before submitting changed canonical URLs. Use Ahrefs manual submission for actual changes after a successful release; automatic submission requires a paid Ahrefs upgrade and is not enabled. Submission acceptance is not proof of indexing.

## Search Console and evidence

The Domain property was verified using DNS TXT. The sitemap was read successfully with eight discovered pages. The homepage and Image, Video and Ultrawide pages all received successful indexing requests on 2026-10-23. Requests are not proof of indexing. Keep the ownership TXT record and verify actual indexing separately.

Local evidence directories (not build inputs or files shipped in this repository):

- `verification/domain-release/`: initial domain migration, redirects and browser acceptance.
- `verification/gsc-launch/`: final repository links, publication, ownership verification and four indexing requests.
- `verification/release-reproduction/`: clean-checkout source verification.

## Rollback

Record the active version before any deployment. A Worker version rollback does not revert independent DNS or Custom Domain bindings. The pre-migration version uses workers.dev canonical URLs, so rolling back that far also reverts the SEO migration. Preserve later changes and unrelated resources. Git revert changes source only; it does not deploy. Never rewrite published Git history because the repository is connected to Lovable.

## Historical implementation notes

The notes below describe earlier stages and may contain superseded preview settings, page counts, repository names and GSC status. The current sections above take precedence. Older documents are being updated incrementally.

## 当前状态（2026-10-23）

按用户要求移除 `.github/workflows/deploy.yml`，不再通过 main push 或 workflow_dispatch 自动执行构建、验收与部署。对应的 CI/CD 结果跟进任务也已删除。提交代码不等于发布；后续部署需明确授权。

已部署的 Cloudflare Worker 保留。此前专用 Ubuntu runner 的注册、服务、安装目录及加密凭据未在本次删除范围内，不应视为已经卸载。历史运行记录可在 GitHub Actions 中查询。

## 保留的部署约束

- 仓库：https://github.com/wherexml/imageaspectratio.com ，分支 `main`。
- Worker：`aspect-ratio-canvas`；地址 https://aspect-ratio-canvas.geekmooc.workers.dev 。
- 构建目标：TanStack Start SSR + Cloudflare Workers Static Assets；部署入口为 `.output/server/wrangler.json`，不能仅上传静态目录。
- `scripts/prepare-worker.mjs` 固定独立 Worker 名称、账号和 compatibility date，避免覆盖其他服务。
- 构建前配置 `VITE_SITE_URL` 为目标 HTTPS origin；保留 `VITE_SITE_INDEXABLE=false`。自定义域名尚未配置。
- noindex 时保留 canonical，sitemap 合法且为空，robots 允许抓取以读取 noindex，不宣告 sitemap。
- 凭据不得写入源码、日志或本地明文文件。

## 后续人工发布验收

获得发布授权后，执行类型检查、生产构建及 Worker 配置准备，在五位 loopback 端口运行产物，再用 `scripts/verify-http.py` 检查四路由、canonical、noindex、sitemap、robots、308 与 404。发布后另行执行公网验收，并保存可复核证据。上述步骤是发布契约，本次移除 CI/CD 未执行新部署。

HTTP 检查器使用明确的 `AspectRatioCanvas-DeploymentCheck/1.0` User-Agent 和 15 秒请求超时。保留既有安全防护。

回滚可采用 Cloudflare Worker 既有版本；Git revert 只回退源码，不会再自动触发部署。不要改写已推送历史。

## 索引就绪验收（2026-10-23）

Steve 已确认本轮范围：先完善索引配置与验收，保留预览 noindex。当前 workers.dev 地址不因本轮优化变为正式可索引站点；不部署、不提交 GSC。现有索引生成逻辑无需修改，本轮扩展的是双模式 HTTP 验收。

`verify-http.py BASE ORIGIN [preview|indexable]` 支持两种发布配置，省略模式仍按 preview 验收。indexable 模式要求四个 canonical URL 完整进入 sitemap、robots 宣告该 sitemap、四页及带查询参数首页返回 index/follow 且 HTTP 头不含 noindex。两种模式都检查 308、404 和抓取端点 HEAD。

本地可用临时环境变量 `VITE_SITE_URL=<已确认的 HTTPS origin> VITE_SITE_INDEXABLE=true npm run build` 验证可索引产物；这不修改环境默认值，也不部署。正式启用前须确定最终域名及发布范围。预览环境继续 false。验收记录：`verification/seo-copy-index/README.md`。


## Updated sitemap and entity contract (2026-10-23)

This supersedes the earlier preview sitemap declaration rule: when a public origin is configured, robots.txt declares its sitemap even in noindex mode. Preview sitemap remains empty. Indexable mode includes seven routes (four tools and About, Privacy, Terms). No origin means no fabricated sitemap URL.

Contact remains unset at the user request; no empty contact link is rendered. Site identity is Aspect Ratio Calculator. Tool pages have WebSite + WebApplication JSON-LD; information pages have WebSite + WebPage. No invented author, date, sameAs or ratings. Evidence: verification/seo-entities/README.md.

## 当前公开索引发布（2026-10-23，覆盖上文预览发布约束）

Steve 已明确授权当前 workers.dev 地址开放索引并部署。`.env.production` 固定公开 origin 和 `VITE_SITE_INDEXABLE=true`，生产构建默认采用该配置；开发模式及未配置环境仍默认 noindex。后续发布不能再照旧覆盖为 false，除非明确回退到预览。公开验收使用 `verify-http.py BASE ORIGIN indexable`，覆盖 7 个页面、HTML/HTTP 索引指令与完整 sitemap。开放索引不等于搜索引擎已经收录；未提交 GSC。

首页采用 MDN 原文定义及常见比例参考，AITDK 检测规则与发布证据见 `verification/indexable-citations/README.md`。

## 开源及身份完善（2026-10-23）

用户授权仓库按当前域名命名并公开：`wherexml/aspect-ratio-canvas.geekmooc.workers.dev`，MIT 许可证，Contact 使用公开 GitHub Issues。维护者为公开账户 wherexml。页脚标明实际内容更新时间，JSON-LD 使用相同 dateModified，不自动取构建时间。新增 Contact 后 sitemap 与 HTTP 验收覆盖 8 个页面。llms.txt 是用途及入口说明，不代表 AI 搜索准入或引用承诺。上述内容覆盖早期 Contact 留空和缺少作者/日期的记录。

## Social navigation release — 2026-11-05

Released version `d6730cb2-d4f7-40ed-977f-302ac90970f2`; previous active/rollback version `17aba283-1729-4bd4-b791-d896ba20855e`. The user authorized publishing the accepted compact Social Media navigation, grouped hub and five platform destinations. Production build, TypeScript, 23 local and 23 production HTTP checks passed; Chrome confirmed compact menu styling and the detail-to-hub journey. Evidence: `verification/social-navigation-release/`. No Git commit/push or indexing submission was performed.
