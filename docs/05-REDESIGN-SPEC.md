# NeedsRadar 前后台分离架构与 UI 改版设计方案（待确认）

> 说明：本方案基于对 `demand-radar.com`（`demand-radar-com`）和 `backlinkhelper.org`（`backlinkhelper-org-2`）的功能拆解，并结合当前 NeedsRadar（`buildgap-radar`）线上真实数据库与采集守护进程整理而成。**当前仅做架构与 UI 原型设计，确认后再进入编码实现。**

---

## 一、两个对标站核心功能拆解与借鉴点

### 1. DemandRadar (`https://www.demand-radar.com/`) —— 强在「公开需求发现与自验证链路」
- **已核实页面结构**：
  - `/` 首页需求库：定位说明 + 统计数据 + 搜索与多维筛选（分类、排序、来源、实现复杂度、产品形态、面向人群）+ 2 列全宽机会卡片 + 分页 + 底部信号预览与订阅。
  - `/ideas/{slug}` 需求详情：独立详情页展示痛点（Pain Point）、目标人群、关键词、变现策略、竞争情况、项目简报（Project Brief）、技术复杂度、信号来源。
  - `/ideas/analyze` 自有想法验证：50–2000 字输入框，围绕市场潜力、竞争与可行性输出评估（区分免费与付费每日次数）。
  - `/signals` 实时信号流：展示原始抱怨/功能诉求摘录、外链、时间与分页。
  - `/daily` 每日报告：按日期沉淀精选需求卡片与更新摘要。
  - 评分体系：双分制 `OPP`（机会分：付费意愿 40% + 竞争可突破度 30% + 紧迫性 15% + 出现频率 15%）与 `ROI`（叠加难度、独立信号量、竞品收入证据），并带 `Blue Ocean`、`Share as poster` 等直观标记。
- **对 NeedsRadar 的启发**：
  - 列表页不要硬塞右半屏详情面板，而是**全宽铺满可扫读卡片**，点击后进入独立 `/demand/[id]` 详情页。
  - 补齐「**实时原始信号流 (`/signals`)**」、「**每日精选报告 (`/daily`)**」和「**AI 验证自有想法 (`/ideas/analyze`)**」，让访客既能找需求，也能测自己的点子。

### 2. Backlink Helper (`https://backlinkhelper.org/login?next=%2Fai-tools`) —— 强在「SaaS 工作区交互与后台控盘手感」
- **已核实界面与组件结构（`WorkspaceShell.tsx`）**：
  - **视觉骨架**：左侧深墨绿固定侧边栏 + 右侧浅灰白底工作区卡片；清晰的面包屑眉标（`eyebrow`）+ 标题 + 右上角主操作按钮。
  - **数据可视化与表格**：顶部 4 张 KPI 概览卡 + 12 周柱状增长趋势图 + 筛选条（搜索框 + 下拉/胶囊筛选 + 保存/导出按钮）+ 高可读数据表（带进度条、状态圆点、收藏按钮）+ 3 列目录卡片网格（`AI 工具榜单`）。
  - **设置与配置面板 (`/settings`)**：工作区资料、通知开关、阈值与数据导出。
- **对 NeedsRadar 的启发**：
  - **后台运营控台 (`/admin`)** 直接采用 Backlink Helper 的左侧边栏 + 白色卡片工作区 + 状态徽章 + 表格进度条风格，用来管理 9 个采集源、频率、配额和运行日志，操作极其直观。
  - **前台的「同行流量基准 (`/benchmarks`)」与「外链/词根库 (`/roots`, `/launchpad`)」** 采用其目录卡片网格 + 可排序数据表，让 340 个对标站和 211+ 核心词根一目了然。

---

## 二、NeedsRadar 现有数据资产盘点（线上实测）

数据库位置：`/root/projects/demand-radar-research/radar_database.db`（SQLite WAL 模式）

| 数据表 | 当前线上体量 | 现有字段与核心价值 | 改版后归属 |
| --- | --- | --- | --- |
| `collected_raw_records` | **13,179** 条 | 原始抓取帖子与元数据 | 后台监控 + 前台 `/signals` 脱敏流 |
| `collection_rejections` | **4,950** 条 | 预过滤淘汰记录与淘汰原因 | 后台质量漏斗与预过滤调参依据 |
| `demand_goldmine` / `demand_occurrences` | **4,867** 条 | 去重聚合后的规范痛点、类别、来源、出现次数 | 前台 `/` 核心列表 + `/demand/[id]` |
| `keyword_serp_validations` | **4,867** 条 | SERP 验证分级（`A_NOW`: 11, `B_QUEUE`: 2,982, `C_WATCH`: 1,799, `D_SKIP`: 75） | 前台筛选排序 + 后台分级策略 |
| `opportunity_market_intel` | **300** 条 | 延伸词根、长尾词、相似流量站、RDAP 可买域名、`buildTier`、`verdictBadge`（`ready`: 33, `community_first`: 234, `watch`: 33） | 前台全量公开展示（不再做残缺打码） |
| `launch_cards` | **300** 条 | MVP 范围、Cutlist、3 步闭环、SEO 冻结文案、48h AI 提示词 | `/demand/[id]` 详情页核心交付物 |
| `peer_benchmark_sites` | **340** 个 | 同行站点域名、类型（indie/giant）、月 UV、黑马标记 | 前台 `/benchmarks` 排行榜 |
| `source_registry` / `source_health` / `source_collection_runs` | **9** 个源 / **238,899** 次记录 | 7 个启用源（`HackerNews_Firebase`, `HackerNews_Algolia`, `GitHub_Issues`, `StackExchange_Questions`, `Reddit_Direct`, `Workflow_Forums`, `Builder_Communities`）均固定 `300s`；2 个禁用源（`DuckDuckGo_Auxiliary`, `GitHub_Releases_Atom`） | **后台 `/admin` 核心调控对象** |

---

## 三、前后台职责边界与当前问题修复

### 1. 为什么旧版前端像“半残的后台”？
1. **首页分栏挤压**：旧版把“列表 + 完整详细报告”挤在同一屏左右两栏，导致列表信息看不全、详情区又塞满长尾词/三步闭环/提示词，扫读效率低。
2. **过度遮挡（Redaction）**：`v3-radar.ts` 与 `query_v3_api.py` 的 `redactOpportunityForTier` 对未付费访客把域名、原帖链接、相似站、可买域名全部打码隐藏，让前台显得信息残缺。
3. **后台控制缺失**：`continuous_radar_daemon.py` 每轮都会调用 `source_registry.py` 的 `register_sources()`，直接用代码里的 `DEFAULT_SOURCE_POLICIES`（固定 `poll_interval_seconds=300`、`LOOP_SLEEP_SECONDS=300`）覆盖数据库配置，导致无法通过页面动态改频率、开关源或调配额。

### 2. 改版后的清晰分工
- **公开前台（Public Frontend）—— 全部核心情报开放、铺满展示、支持自验证**
  - **首页需求库 (`/`)**：全宽铺满卡片/表格双视图；每条直接显示完整标题、痛点摘要、同源频次、词根与长尾词数、相似站数、可买域名数、开发复杂度、变现类型、分级标签、OPP/ROI 评分；支持多维筛选与排序；**不显示右侧挤压详情框**。
  - **独立需求详情页 (`/demand/[id]`)**：全宽阅读布局，Tab/分段展示：① 痛点闭环（Input → Process → Output）与原帖证据链（直接放开原帖链接与出现次数）；② 关键词矩阵（核心词根 + Google 长尾词）；③ 相似竞争站与月 UV + RDAP 可注册域名列表；④ 48h MVP 开发范围、不做什么 Cutlist 与一键复制 AI Prompt + `.md` 报告导出。
  - **AI 想法验证 (`/ideas/analyze`)**：用户输入自己的点子（50–2000 字），服务端检索 `demand_goldmine` 与 `peer_benchmark_sites` 相似痛点/竞品并结合 LLM 输出可行性评估与切入建议。
  - **实时信号流 (`/signals`) & 每日精选 (`/daily`)**：公开浏览最新抓取的原始吐槽流与按日聚合的新增高潜机会。
  - **同行流量基准 (`/benchmarks`) & 词根外链库 (`/roots`, `/launchpad`)**：采用 Backlink Helper 风格的筛选条 + 排序表 + 目录卡片。
  - *注*：若后续仍保留商业化（Pro），仅对**高频 AI 想法验证额度、批量 CSV/报告导出、API/Webhook 订阅**收费，而**不在需求库列表与详情页打马赛克**。

- **运营后台（Admin Control Plane `/admin`）—— 专属采集、清洗、评分与发布调度中心**
  - **鉴权隔离**：沿用并强化 `NR_OWNER_ACCESS_KEY` / Admin 角色校验（`/api/admin/*` 全量鉴权），普通用户不可访问。
  - **`/admin` 采集总览与转化漏斗**：原始抓取 → 预过滤淘汰（展示 Top 淘汰原因）→ 去重入库 → SERP 验证 → 深度富化与 Launch Card 覆盖率 + 12 周每日趋势图。
  - **`/admin/sources` 采集源与频率调控**：
    - 展示全部 9 个采集源（启用开关、抓取间隔 `poll_interval_seconds` 可设为 `60s / 300s / 900s / 1800s / 3600s / 自定义`、单轮抓取上限 `max_items_per_run`、退避重试次数、最近状态与连续失败数）。
    - 支持「保存策略（写入 `source_overrides` 表）」与「立即单次触发」。
  - **`/admin/pipeline` 清洗、评分与富化配置**：
    - 预过滤规则：最小文本长度、排除词黑名单、最低互动阈值、去重相似度阈值。
    - AI 与 SERP 调度：SERP 日配额上限、AI 富化批次大小与运行间隔、RDAP 域名检测开关与并发数、每日自动生成 Launch Card 上限。
    - 运营审核发布：对刚入库的 `A_NOW / B_QUEUE` 需求支持人工打标（置顶、归档、修改分类）及生成当日 `/daily` 精选。
  - **`/admin/runs` 任务日志与健康监控**：查看 `source_collection_runs` 和 `admin_job_runs` 的每次执行耗时、新增数、淘汰数、报错堆栈与一键重试。

---

## 四、核心前后台模块与数据流转逻辑

### 1. 守护进程动态配置改造（解决 `300s` 硬编码无法调控问题）
1. **新增 SQLite 控制表**（位于 `radar_database.db`，WAL 模式）：
   - `source_overrides(source_name PRIMARY KEY, enabled INTEGER, poll_interval_seconds INTEGER, max_items_per_run INTEGER, priority INTEGER, retry_limit INTEGER, updated_at TEXT, updated_by TEXT)`
   - `system_settings(key PRIMARY KEY, value_json TEXT, updated_at TEXT)`（存放预过滤规则、SERP/LLM 日配额、富化间隔、Daemon 主循环心跳步长等）
   - `admin_job_runs(id PRIMARY KEY, job_type TEXT, target TEXT, status TEXT, started_at TEXT, finished_at TEXT, stats_json TEXT, error_message TEXT)`
2. **`source_registry.py` 与 `continuous_radar_daemon.py` 改造逻辑**：
   - `register_sources()` 仅在首次初始化或代码新增源时插入默认值，**不再覆盖** `source_overrides` 中的运营修改；运行时按 `effective_policy = merge(DEFAULT_SOURCE_POLICIES, source_overrides)` 计算每个源的 `enabled` 和 `poll_interval_seconds` 。
   - Daemon 主循环睡眠步长缩为固定短心跳（例如 `30s`），每轮检查各源 `now - last_run_at >= effective_poll_interval` 才触发采集，从而支持从 60 秒到数小时的差异化频率控制，同时检查 `admin_job_runs` 中状态为 `queued` 的手动触发任务。
3. **读写隔离**：
   - 公开前台接口（`GET /api/v3/demands`, `GET /api/v3/demands/[id]`, `GET /api/v3/signals`, `GET /api/v3/daily`, `GET /api/v3/benchmarks`）继续走 `mode=ro` 只读查询桥（`query_v3_api.py`），绝不锁写库。
   - 后台接口（`GET/PATCH /api/admin/sources`, `GET/PATCH /api/admin/settings`, `POST /api/admin/jobs/run`, `GET /api/admin/runs`）通过短事务写入 `radar_database.db`（带 `timeout=10s` 与 WAL）。

### 2. 前台核心模块划分
| 模块 | 路由 | 数据源 | 核心能力 |
| --- | --- | --- | --- |
| 需求发现首页 | `/` | `demand_goldmine` + `keyword_serp_validations` + `opportunity_market_intel` | 全宽卡片/表格视图切换、搜索、多维筛选（阶段/产品形态/变现/来源/分级）、多种排序 |
| 需求详情工作页 | `/demand/[id]` | 上表 + `demand_occurrences` + `launch_cards` | 痛点闭环、原帖证据列表、词根与长尾词、相似站流量对比、可买域名、48h 开发 Blueprint 与 `.md` 导出 |
| AI 想法验证 | `/ideas/analyze` | 检索本地库 + LLM 评估 | 输入自有想法 → 匹配相似已有痛点与竞争站 → 生成 OPP/ROI 预估与避坑建议 |
| 实时信号 & 日报 | `/signals`, `/daily` | `collected_raw_records`, `demand_goldmine` | 原始抱怨流检索 + 每日新增高分需求摘要 |
| 同行基准 & 发射台 | `/benchmarks`, `/roots`, `/launchpad` | `peer_benchmark_sites`, `opportunity_market_intel` | 340 个对标站流量榜、词根库、外链提交清单 |

---

## 五、Figma 与交互式原型说明

- **Figma 状态说明**：当前连接中的 Figma 接口仅支持读取、评论与 Dev Resources 挂载（官方 REST API 不提供直接新建空白 `.fig` 画布图层的接口），且内置浏览器中的 `figma.com` 目前处于未登录状态。
- **本轮已同步提供的预览**：已生成可交互高保真原型 [`needsradar-ui-blueprint.html`](./needsradar-ui-blueprint.html) 并在对话内直接渲染，支持切换查看 **公开前台 5 大页面** 与 **运营后台 4 大控盘面板**。
- **如需同步进 Figma**：你可以在 Screen 面板的 Browser 标签页登录 Figma，或直接提供目标 Figma 文件链接（`file_key`）/ Team 链接，我即可把这套结构与标注同步挂载到对应 Figma 文件中。
