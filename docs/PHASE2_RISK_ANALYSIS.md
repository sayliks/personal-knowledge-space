# Phase 2 Planning: Potential Problems & Risk Analysis

## Overview
Phase 2 adds AI capabilities: pgvector extension, embeddings, RAG search, and AI summaries.

---

## Critical Issues

### 1. pgvector Extension Availability
**Problem:** Supabase free tier may not support pgvector extension  
**Impact:** Blocks entire Phase 2  
**Risk Level:** 🔴 Critical

**Investigation needed:**
- Check Supabase plan (free/pro/team)
- Verify pgvector is available: `CREATE EXTENSION IF NOT EXISTS vector;`
- Check vector dimension limits (free tier may have restrictions)

**Mitigation:**
- Test extension creation before any code changes
- If unavailable, Phase 2 requires Supabase upgrade ($25/month Pro plan)
- Alternative: Use external vector DB (Pinecone, Weaviate) but adds complexity

---

### 2. Prisma 7 + pgvector Support
**Problem:** Prisma 7 vector support is experimental/limited  
**Impact:** May need raw SQL for vector operations  
**Risk Level:** 🟡 High

**Known issues:**
- `Unsupported("vector")` type in Prisma schema works for storage
- Vector similarity queries (`<->`, `<#>`, `<=>`) require raw SQL
- No type safety for vector operations
- Index creation (`USING ivfflat`) must be done manually

**Example of what won't work:**
```typescript
// This won't work - Prisma doesn't understand vector operators
await prisma.documentEmbedding.findMany({
  where: { embedding: { similarity: queryVector } }
})
```

**What you'll need:**
```typescript
// Raw SQL required
await prisma.$queryRaw`
  SELECT * FROM "DocumentEmbedding"
  ORDER BY embedding <-> ${queryVector}::vector
  LIMIT 10
`
```

**Mitigation:**
- Create a `lib/vector-search.ts` abstraction layer
- Use raw SQL for all vector operations
- Add TypeScript types manually for query results

---

### 3. Embedding API Costs
**Problem:** Generating embeddings for all content is expensive  
**Impact:** Ongoing operational costs  
**Risk Level:** 🟡 High

**Cost estimation (OpenAI text-embedding-3-small):**
- Current: 6 posts × ~1000 tokens avg = 6,000 tokens
- Cost: $0.00002 per 1K tokens = $0.00012 (negligible)
- **But:** Re-embedding on every edit adds up
- **And:** Chinese text uses more tokens than English

**Monthly projection:**
- 10 new posts/month × 1000 tokens = 10,000 tokens/month
- 20 edits/month × 1000 tokens = 20,000 tokens/month
- Total: ~30,000 tokens/month = $0.60/month (still cheap)

**Real concern:** AI summaries
- GPT-4o: $2.50 per 1M input tokens, $10 per 1M output tokens
- 10 posts × 1000 input + 200 output = $0.025 + $0.002 = $0.027/month
- Still cheap, but scales with usage

**Mitigation:**
- Cache embeddings, only regenerate on content change
- Use cheaper models (text-embedding-3-small, not ada-002)
- Batch embedding generation
- Add rate limiting to prevent abuse

---

### 4. Content Chunking Strategy
**Problem:** How to split documents for embedding?  
**Impact:** Affects search quality and storage  
**Risk Level:** 🟡 High

**Challenges:**
- Chinese text doesn't have clear word boundaries
- Fixed-size chunks (512 tokens) may split sentences awkwardly
- Semantic chunking is complex (requires NLP)
- Too small = loss of context, too large = poor retrieval

**Options:**
1. **Fixed token chunks (512)** - Simple but crude
2. **Paragraph-based** - Better semantics but variable size
3. **Semantic chunking** - Best quality but complex (needs LangChain/LlamaIndex)

**Recommendation:** Start with paragraph-based, migrate to semantic later

**Implementation concern:**
```typescript
// How to handle this in Chinese?
const chunks = content.split('\n\n') // Paragraphs
// vs
const chunks = splitByTokens(content, 512) // Fixed size
```

**Mitigation:**
- Use `tiktoken` for accurate token counting
- Store chunk metadata (position, overlap)
- Allow re-chunking strategy changes without data loss

---

### 5. Vector Index Performance
**Problem:** Vector similarity search is slow without proper indexing  
**Impact:** Search becomes unusable as data grows  
**Risk Level:** 🟡 High

**Technical details:**
- Exact nearest neighbor (no index): O(n) - scans all vectors
- With IVFFlat index: O(√n) - much faster but approximate
- Index creation is expensive (locks table)

**Index creation:**
```sql
CREATE INDEX ON "DocumentEmbedding" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Problems:**
- `lists` parameter depends on row count (rule: √rows)
- Index must be rebuilt as data grows
- Index creation locks table (downtime)
- Approximate search may miss relevant results

**Mitigation:**
- Create index after initial embedding generation
- Use `CONCURRENTLY` for index creation (no locks)
- Monitor query performance, rebuild index periodically
- Start with exact search, add index when >1000 embeddings

---

### 6. Embedding Dimension Mismatch
**Problem:** Different models use different dimensions  
**Impact:** Can't switch models without re-embedding everything  
**Risk Level:** 🟠 Medium

**Examples:**
- OpenAI text-embedding-3-small: 1536 dimensions
- OpenAI text-embedding-3-large: 3072 dimensions
- Anthropic (if they release): Unknown dimensions

**Schema issue:**
```prisma
embedding Unsupported("vector(1536)") // Hardcoded dimension
```

**If you switch models:**
- Must drop and recreate column with new dimension
- Must re-embed all documents
- Downtime required

**Mitigation:**
- Store model name in `DocumentEmbedding.model` field
- Document dimension in schema comments
- Plan for migration script if switching models
- Consider storing multiple embeddings (expensive but flexible)

---

### 7. Stale Embeddings
**Problem:** Embeddings become outdated when content changes  
**Impact:** Search returns irrelevant results  
**Risk Level:** 🟠 Medium

**Scenarios:**
- User edits post content → embeddings still reflect old content
- User changes title → embeddings don't match
- User deletes chunks → orphaned embeddings remain

**Solutions:**
1. **Regenerate on save** - Simple but slow (blocks save)
2. **Background job** - Better UX but eventual consistency
3. **Webhook/trigger** - Complex but real-time

**Recommendation:** Background job with queue

**Implementation:**
```typescript
// After post update
await updatePost(...)
await queueEmbeddingJob(postId) // Async, doesn't block
```

**Mitigation:**
- Add `embeddedAt` timestamp to track staleness
- Show warning in admin if embeddings are stale
- Batch regeneration script for bulk updates

---

### 8. Hybrid Search Complexity
**Problem:** Combining vector + keyword search is non-trivial  
**Impact:** Poor search UX if not done right  
**Risk Level:** 🟠 Medium

**Challenges:**
- How to merge results from two different queries?
- How to weight vector vs keyword results?
- How to handle queries that match one but not the other?

**Example:**
```typescript
// Vector search returns: [A, B, C]
// Keyword search returns: [C, D, E]
// Final result should be: ???
```

**Approaches:**
1. **Union** - Show all results (A, B, C, D, E) - too many
2. **Intersection** - Show only C - too few
3. **Weighted merge** - Complex scoring algorithm
4. **Fallback** - Try vector first, keyword if no results

**Recommendation:** Weighted merge with RRF (Reciprocal Rank Fusion)

**Mitigation:**
- Start with vector-only search
- Add keyword fallback for zero results
- Implement hybrid later based on user feedback

---

### 9. AI Summary Hallucinations
**Problem:** LLMs may generate incorrect summaries  
**Impact:** Misleading information shown to users  
**Risk Level:** 🟠 Medium

**Examples:**
- Summary mentions facts not in the article
- Summary contradicts the article content
- Summary is generic/useless ("This article discusses...")

**Mitigation:**
- Use grounded generation (cite specific paragraphs)
- Add disclaimer: "AI-generated summary"
- Allow users to report bad summaries
- Regenerate summaries periodically with better prompts
- Store prompt version for reproducibility

---

### 10. Database Migration Complexity
**Problem:** Adding vector columns to existing schema is tricky  
**Impact:** Potential data loss or downtime  
**Risk Level:** 🟠 Medium

**Steps required:**
1. Add `DocumentEmbedding` and `AISummary` tables
2. Install pgvector extension
3. Generate embeddings for existing documents
4. Create vector indexes
5. Update application code

**Risks:**
- Extension installation may fail (permissions)
- Embedding generation may timeout (6 posts × API latency)
- Index creation may lock table
- Application may break if embeddings missing

**Mitigation:**
- Test on staging database first
- Make embeddings optional (graceful degradation)
- Generate embeddings in background after migration
- Add feature flag to enable/disable vector search

---

### 11. Token Limits & Context Windows
**Problem:** Long documents may exceed LLM context limits  
**Impact:** Can't generate summaries for long posts  
**Risk Level:** 🟢 Low

**Limits:**
- GPT-4o: 128K tokens input
- Claude 3.5 Sonnet: 200K tokens input
- Your longest post: Likely <10K tokens

**Not a problem now, but:**
- Future long-form content may hit limits
- Chunked embeddings don't help (summary needs full context)

**Mitigation:**
- Truncate content if >100K tokens
- Use map-reduce summarization for very long docs
- Show warning in admin for oversized content

---

### 12. Multilingual Embeddings
**Problem:** Your blog has Chinese content, embeddings may not work well  
**Impact:** Poor search quality for Chinese queries  
**Risk Level:** 🟢 Low

**Concern:**
- OpenAI embeddings are trained primarily on English
- Chinese semantic similarity may be less accurate
- Mixed language queries (Chinese + English) are tricky

**Testing needed:**
- Embed Chinese post: "语言模型为何会产生幻觉"
- Query with Chinese: "大模型幻觉"
- Verify results are relevant

**Mitigation:**
- Test with real Chinese content before full rollout
- Consider multilingual models (OpenAI supports 100+ languages)
- Add language detection and use language-specific models if needed

---

## Recommended Phase 2 Approach

### Step 0: Validation (Do First)
1. ✅ Verify pgvector is available on Supabase
2. ✅ Test vector operations with raw SQL
3. ✅ Estimate costs for your usage
4. ✅ Test embedding quality with Chinese content

### Step 1: Schema & Infrastructure
- Add `DocumentEmbedding` and `AISummary` models
- Install pgvector extension
- Create migration script (non-destructive)

### Step 2: Embedding Service (Isolated)
- Create `lib/embedding-service.ts`
- Implement chunking strategy
- Add embedding generation function
- Test with 1-2 posts manually

### Step 3: Vector Search (Feature Flag)
- Implement vector similarity search
- Add feature flag to enable/disable
- Test search quality vs keyword search
- Keep keyword search as fallback

### Step 4: AI Summaries (Optional)
- Create `lib/summary-service.ts`
- Generate summaries for existing posts
- Add UI to display summaries
- Add regeneration capability

### Step 5: Background Jobs (Polish)
- Set up queue for async embedding generation
- Add stale embedding detection
- Implement batch regeneration

---

## Decision Points

Before starting Phase 2, decide:

1. **Embedding provider:** OpenAI or Anthropic?
2. **Summary provider:** GPT-4o, Claude, or both?
3. **Chunking strategy:** Fixed tokens or paragraphs?
4. **Search approach:** Vector-only, keyword-only, or hybrid?
5. **Deployment:** Feature flag or full rollout?
6. **Budget:** Acceptable monthly API costs?

---

## Recommendation

**Don't start Phase 2 yet.** First:
1. Complete manual testing of Phase 1 admin operations
2. Verify pgvector availability on your Supabase instance
3. Test embedding generation with 1 Chinese post
4. Estimate real costs based on your usage patterns
5. Decide on embedding/summary providers

Once validated, Phase 2 can proceed with confidence.
