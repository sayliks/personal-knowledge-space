# 代码审查与文档优化记录

> 每 5 分钟自动审查，只审查和提交文档，不修改业务代码。

---

## 审查 #10 — 2026-05-28 00:20

**分支**: master (ahead of origin by 23 commits)
**未提交业务变更**: 与审查 #9 相同（20 files, +229/-176），无新增变更

### #10 审查结论

**本次审查未发现新变更。** 业务代码自上次审查以来无变动，已审查内容见审查 #8 和 #9。

- 剩余未修复项同审查 #9（低优先级）

---

## 审查 #9 — 2026-05-28 00:15

**分支**: master (ahead of origin by 22 commits)
**未提交业务变更** (20 files, +229/-176): 继续修复审查 #7 遗留问题 + 测试修复

### #9 已修复项目

**i18n**:

- ✅ [中] KnowledgeGraph.tsx — "Failed to load graph" → `t("loadError")`，"nodes · links" → `t("stats")`
- ✅ [低] Header.tsx — 缩进修复 + `sayliks&apos;s blog` → `{t("siteTitle")}`
- ✅ [低] ThemeToggle.tsx — `aria-label="Toggle theme"` → `aria-label={t("toggleTheme")}`
- ✅ [低] SearchDialog.tsx — 移除多余 `"搜索中..."` 回退
- ✅ messages/en.json + zh.json — 添加 `common.toggleTheme`、`common.siteTitle`、`graph.loadError`、`graph.stats`

**可访问性**:

- ✅ [中] CommentSection.tsx — 头像 `alt=""` → `alt={comment.authorName}`

**一致性**:

- ✅ [中] search/route.ts — 改用 `searchPosts()` from lib/queries.ts，不再直接调用 Prisma

**错误处理**:

- ✅ [中] Backlinks.tsx — `.catch()` 添加 `console.error` 日志
- ✅ [中] KnowledgeGraph.tsx — setTimeout 添加清理函数
- ✅ [中] SearchDialog.tsx — setTimeout 添加清理函数

**死代码**:

- ✅ [低] lib/markdown.ts — 删除未使用的 `getExcerpt` 和 `stripMarkdown`

**测试**:

- ✅ MarkdownRenderer.test.tsx — 添加 `jest.mock("rehype-raw")` 解决 ESM 兼容性

### #9 审查结论

**变更合理，继续系统性解决审查 #7 遗留问题。**

- i18n 覆盖率提升：4 个硬编码字符串已国际化
- 可访问性：CommentSection 头像 alt 已修复
- 一致性：search route 遵循 CLAUDE.md 查询层约定
- 错误处理：Backlinks 日志、两个 setTimeout 清理
- 死代码清理：lib/markdown.ts 未使用函数已删除
- 无新引入问题

**剩余未修复（低优先级）**:

- Admin server actions 输入校验（formData.get → Zod）
- CommentForm.tsx 头像 `alt=""`
- validations.ts 中 createCategorySchema / createTagSchema 未使用
- Footer.tsx 空组件
- Pagination、SearchForm、AdminLayoutClient aria-label 缺失
- Admin 页面直接调用 Prisma

---

## 审查 #8 — 2026-05-28 00:00

**分支**: master (ahead of origin by 21 commits)
**未提交业务变更** (8 files, +167/-107): 批量修复审查 #7 问题

### 已修复（审查 #7 问题）

**安全**:

- ✅ [高] comments/route.ts — `userId` 不再来自请求体，改用 `session.user.id`
- ✅ [高] posts/route.ts — 标签替换改为 `prisma.$transaction()` 事务
- ✅ [高] posts/route.ts — `session.user.id!` 非空断言已移除，添加 `!session.user.id` 检查
- ✅ [中] posts/route.ts — id 使用 `z.string().cuid()` 校验（PUT + DELETE）

**错误处理**:

- ✅ [高] posts/route.ts — Prisma create/update/delete 全部加 try/catch + console.error
- ✅ [中] comments/route.ts — Prisma create + findMany 加 try/catch
- ✅ [中] graph/route.ts — catch 中添加 console.error
- ✅ [中] CommentForm.tsx — fetch 改为 try/catch/finally，`setSubmitting(false)` 放入 finally
- ✅ [中] SearchDialog.tsx — 添加 `if (!res.ok) throw`

**i18n / 一致性**:

- ✅ [高] RecentPosts.tsx — `<a>` → `<Link>`，`toLocaleDateString("zh-CN")` → `formatDate()`
- ✅ [中] 两个 route 添加 `request.json()` try/catch
- ✅ [低] SearchDialog.tsx — 移除多余的 `"搜索中..."` 回退
- ✅ [低] posts/route.ts + comments/route.ts — 添加 `export const runtime = "nodejs"`
- ✅ validations.ts — 移除 `userId` 字段

### #8 审查结论

**变更合理，是审查 #7 发现问题的系统性修复。**

- 所有 4 个高优先级安全问题已解决
- 绝大部分中优先级错误处理问题已解决
- 无新引入问题
- 剩余未修复：可访问性（alt=""、aria-label）、死代码、Admin 直接调用 Prisma
