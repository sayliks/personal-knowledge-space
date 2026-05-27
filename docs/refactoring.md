# AI Knowledge Workspace — 数据库设计

> 定位：从个人博客演进为 AI 知识管理系统。兼容现有博客，支持知识库、图谱、AI 能力及未来扩展。

## 一、核心设计理念

整个系统只有几个核心对象：

- **User** — 用户
- **Document** — 文档（统一模型）
- **Tag** — 标签
- **Relation** — 文档间关系
- **Embedding** — 向量嵌入

**核心思想：一切都是 Document。** 博客文章是 `Document(type=POST)`，笔记是 `Document(type=NOTE)`，About 页面是 `Document(type=PAGE)`。

```
User
 └─ Document
      ├─ Tag
      ├─ Relation
      ├─ Embedding
      ├─ AI Summary
      └─ Graph Node
```

---

## 二、Prisma Schema

### 1. User

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatar    String?

  documents Document[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Document（核心）

```prisma
model Document {
  id           String   @id @default(cuid())

  title        String
  slug         String   @unique

  content      String   @db.Text
  excerpt      String?  @db.Text

  type         DocumentType
  status       DocumentStatus
  visibility   Visibility

  coverImage   String?

  parentId     String?
  parent       Document? @relation("DocumentTree", fields: [parentId], references: [id])
  children     Document[] @relation("DocumentTree")

  authorId     String
  author       User @relation(fields: [authorId], references: [id])

  tags         DocumentTag[]

  outgoingRelations DocumentRelation[] @relation("OutgoingRelations")
  incomingRelations DocumentRelation[] @relation("IncomingRelations")

  embeddings   DocumentEmbedding[]

  aiSummary    AISummary?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  publishedAt  DateTime?

  @@index([slug])
  @@index([type])
  @@index([status])
}
```

#### Document 枚举

```prisma
enum DocumentType {
  POST    // 博客文章
  NOTE    // 知识笔记
  PAGE    // About 等页面
  DRAFT   // 草稿
}

enum DocumentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum Visibility {
  PUBLIC    // 公开
  PRIVATE   // 私有笔记
  UNLISTED  // 有链接可访问
}
```

#### parent-child 文档树

通过 `parentId` 自引用实现层级结构，例如：

```
AI
 ├─ RAG
 ├─ Embedding
 └─ Agent
```

---

## 三、标签系统

### Tag

```prisma
model Tag {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  documents DocumentTag[]
  createdAt DateTime @default(now())
}
```

### DocumentTag（多对多）

```prisma
model DocumentTag {
  documentId String
  tagId      String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  tag        Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([documentId, tagId])
}
```

---

## 四、知识关系系统（Obsidian 风格双向链接）

```prisma
model DocumentRelation {
  id              String @id @default(cuid())
  fromDocumentId  String
  toDocumentId    String
  relationType    RelationType
  fromDocument    Document @relation("OutgoingRelations", fields: [fromDocumentId], references: [id])
  toDocument      Document @relation("IncomingRelations", fields: [toDocumentId], references: [id])
  createdAt       DateTime @default(now())

  @@index([fromDocumentId])
  @@index([toDocumentId])
}

enum RelationType {
  BACKLINK
  REFERENCE
  RELATED
  QUOTE
}
```

**为什么 Relation 很重要：** `[[React]]`、`[[Next.js]]` 这样的 wiki-link 都会解析成 `DocumentRelation`，这决定了 Graph、AI 推荐、Backlinks、Related Posts 能否成立。

图谱数据直接从 `DocumentRelation` 生成，不需要单独的 Graph 表。前端用 force graph 渲染即可。

---

## 五、AI 系统

### 1. DocumentEmbedding（向量嵌入）

```prisma
model DocumentEmbedding {
  id           String @id @default(cuid())
  documentId   String
  document     Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  chunkIndex   Int
  chunkText    String @db.Text
  embedding    Unsupported("vector")
  model        String
  createdAt    DateTime @default(now())

  @@index([documentId])
}
```

**为什么需要 chunk：** AI 不直接处理整篇文章，而是 切片 → embedding → 向量检索，每块单独 embedding。

### 2. AISummary

```prisma
model AISummary {
  id          String @id @default(cuid())
  documentId  String @unique
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  summary     String @db.Text
  model       String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### RAG 未来流程

```
用户问题 → embedding → 向量检索 → 召回 chunks → 拼接上下文 → LLM 回答
```

---

## 六、未来扩展预留

当前仅定义结构，暂不实现：

- **Favorite** — 收藏系统
- **ReadingHistory** — 阅读历史
- **ChatSession** — AI Chat
- **Workflow** — Agent Workflow

> 现在不预留，以后很容易炸。

---

## 七、推荐目录结构

从平铺的 `components/`、`lib/` 大杂烩迁移到 **Feature-based Structure**：

```
src/
 ├─ features/
 │   ├─ document/
 │   ├─ graph/
 │   ├─ search/
 │   ├─ ai/
 │   ├─ tag/
 │   └─ auth/
 │
 ├─ components/
 ├─ lib/
 ├─ server/
 ├─ hooks/
 └─ app/
```

---

## 八、实施路线

### 第一阶段（基础）

- Document 模型
- Tag 系统
- Relation 关系
- 文档树
- Markdown 渲染
- 搜索

### 第二阶段（AI）

- Embedding + pgvector
- RAG 语义检索
- AI Summary
- AI 问答

---

## 九、项目定位

从 **个人博客** 升级为 **AI Knowledge Workspace**。

> 基于 Next.js、Supabase 与 Prisma 重构个人博客为 AI 知识管理系统，设计统一 Document 数据模型，实现文档树、双向链接、知识图谱与全文搜索；结合 pgvector 与 RAG 构建语义检索与 AI 问答能力。
