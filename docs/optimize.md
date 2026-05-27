# 代码审查与文档优化记录

> 每小时自动审查，记录代码审查结果和文档优化建议。

---

## 审查 #5 — 2026-05-27 20:00（ESLint 当前状态）

**发现**: 16 问题 (9 errors, 7 warnings)

**Error 优先级**:

| 文件 | 问题 | 类型 |
|------|------|------|
| `CommentForm.tsx:24-29` | setState 在 useEffect 内直接调用 | `react-hooks/set-state-in-effect` |
| `KnowledgeGraph.tsx:79-80` | setState 在 useEffect 内直接调用 + `any` 类型 | `react-hooks/set-state-in-effect`, `@typescript-eslint/no-explicit-any` |
| `SearchDialog.tsx:36,43` | setState 在 useEffect 内直接调用 | `react-hooks/set-state-in-effect` |
| `ThemeToggle.tsx:11` | setState 在 useEffect 内直接调用 | `react-hooks/set-state-in-effect` |
| `Header.tsx:13` | 未转义引号实体 | `react/no-unescaped-entities` |
| `auth.ts:48` | `any` 类型 | `@typescript-eslint/no-explicit-any` |

---

## 审查 #4 — 2026-05-27 20:00（文档专项审查）

**范围**: `docs/` + `CLAUDE.md` + `AGENTS.md`

**[中]** Backlinks.tsx try/catch 包裹 JSX（ESLint 违规）→ 已改为 .catch()
**[低]** optimize.md 过时记录可清理

---

## 审查 #6 — 2026-05-27 20:30（文档深度审查，第二轮）

**范围**: `docs/` + `CLAUDE.md` + `AGENTS.md`

### 发现的问题

**[中] CLAUDE.md:100 Backlinks.tsx 错误处理描述过时**

- 现文: "Backlinks.tsx (server component, wrapped in try/catch)"
- 实际: 已改为 `.catch()` 链式调用，不存在 try/catch
- 修复: 删除 "wrapped in try/catch" 描述

**[低] CLAUDE.md:72 i18n 命名空间数量不准确**

- 现文: "~13 namespaces"
- 实际: 15 个（common, about, search, post, admin, footer, notFound, error, pagination, categories, tags, posts, home, graph, auth）
- 近期新增了 posts、home、graph 三个命名空间
- 修复: "~13" → "~15"

**[低] CLAUDE.md:54 validations 导出 schema 列举不完整**

- 现文: "createPostSchema, createCommentSchema, etc"
- 实际还有 createCategorySchema, createTagSchema
- 不影响理解，可不改

**[低] refactoring.md pgvector 无前置说明**

- `Unsupported("vector")` 需要 pgvector 扩展，但项目当前未安装
- 建议在 Schema 块前加注释说明这是未来设计

**[低] 本次审查标题与内容不匹配**

- 审查 #4 标题写"文档专项审查"，但内容只讨论了 Backlinks.tsx 代码问题
- 实际的文档审查发现已在上一轮处理

---

## 审查 #2 — 2026-05-27 18:57

**范围**: AdminLayoutClient.tsx 自定义拖拽实现

**已修复**:

- [高] 内存泄漏 — 事件监听器未清理
- [中] 拖拽手柄宽度不足
- [中] 残留未使用资源
