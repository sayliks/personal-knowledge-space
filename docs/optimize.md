# 代码审查与文档优化记录

> 每小时自动审查，只审查和提交文档，不修改业务代码。

---

## 审查 #8 — 2026-05-27 20:50

**分支**: master (ahead of origin by 6 commits)
**未提交变更**:

- `components/layout/ThemeToggle.tsx` — useEffect 单行 → 多行写法
- `components/blog/Backlinks.tsx` — 无实际 diff（CRLF 换行符差异）
- `.claude/` 配置文件变更

### 审查结论

**本次审查未发现代码问题。**

- ThemeToggle.tsx: 纯格式调整，`useEffect(() => { setMounted(true) }, [])` 无风险
- Backlinks.tsx: git diff 为空，文件与 HEAD 一致
- PLAN.md / refactoring.md: 内容与代码一致

---

## 审查 #9 — 2026-05-27 21:00（文档深度审查，第三轮）

**范围**: 全部文档与代码交叉验证

### 发现的问题

**[中] CLAUDE.md:112 和 AGENTS.md:55 引用不存在的文件**

- 两处都引用 `docs/plan.md`（小写），但该文件已删除，仅保留 `docs/PLAN.md`（大写）
- Linux 文件系统上会 404
- 修复: `docs/plan.md` → `docs/PLAN.md`

**[中] Markdown 渲染不支持 HTML**

- 当前 `react-markdown` 默认禁止 raw HTML（安全策略）
- 如果文章中包含 HTML 标签（如 `<details>`、`<iframe>`）会被忽略
- 修复: 引入 `rehype-raw` 插件启用 HTML 渲染（需注意 XSS 风险）

**[低] AGENTS.md:5 Setup 注释遗漏环境变量**

- 现文: `# Fill DATABASE_URL, DIRECT_URL, AUTH_SECRET`
- `.env.example` 还要求 `AUTH_URL`、`ADMIN_EMAIL`、`ADMIN_PASSWORD`
- 修复: 补全注释或改为 "see .env.example for required variables"

**[低] refactoring.md:59 DRAFT 同时出现在 DocumentType 和 DocumentStatus**

- `DocumentType { POST, NOTE, PAGE, DRAFT }` — DRAFT 是状态不是类型
- 会导致逻辑矛盾：`type=DRAFT, status=PUBLISHED`
- 修复: 从 DocumentType 中移除 DRAFT，文档类型只保留 POST/NOTE/PAGE

**[低] CLAUDE.md:42 Prisma 输出路径 `../` 相对定位**

- 文档说 client 生成到 `app/generated/prisma/`，实际 `schema.prisma` 写 `output = "../app/generated/prisma"`（相对 prisma/ 目录）
- 说法正确但容易误解
- 修复: 加注 "(relative to prisma/ directory)"

---

## 审查 #7 — 2026-05-27 20:35

**变更**: 还原 Backlinks.tsx（定时任务误改业务代码），更新定时任务规则禁止修改业务代码

**未提交业务变更**:

- `components/blog/Backlinks.tsx` — try/catch → .catch() 改动已还原（超出审查范围）

---

## 审查 #6 — 2026-05-27 20:30（文档深度审查）

**范围**: `docs/` + CLAUDE.md + AGENTS.md

**[中]** CLAUDE.md:100 Backlinks.tsx 错误处理描述过时 → 仍为 try/catch，实际已改为 .catch()

**[低]** CLAUDE.md:72 i18n 命名空间 "~13" → 实际 15 个

**[低]** refactoring.md pgvector 需要前置说明
