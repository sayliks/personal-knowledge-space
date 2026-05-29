# Embedding Providers Available in Mainland China

## ✅ Available Options

### 1. **Alibaba Cloud (阿里云) - DashScope**
- **Model:** text-embedding-v1, text-embedding-v2
- **Dimensions:** 1536
- **Cost:** ¥0.0007 per 1K tokens (~$0.0001)
- **API:** https://dashscope.aliyuncs.com
- **Pros:** Fast in China, cheap, good Chinese support
- **Cons:** Less proven than OpenAI

**Setup:**
```bash
npm install @alicloud/dashscope
```

```typescript
import DashScope from '@alicloud/dashscope';
const client = new DashScope({ apiKey: process.env.DASHSCOPE_API_KEY });
const response = await client.textEmbedding({
  model: 'text-embedding-v2',
  input: { texts: [text] }
});
```

### 2. **Baidu (百度) - Qianfan**
- **Model:** Embedding-V1
- **Dimensions:** 384
- **Cost:** ¥0.002 per 1K tokens (~$0.0003)
- **API:** https://cloud.baidu.com/product/wenxinworkshop
- **Pros:** Good Chinese support, stable
- **Cons:** Lower dimensions (384 vs 1536)

### 3. **Tencent Cloud (腾讯云) - Hunyuan**
- **Model:** hunyuan-embedding
- **Dimensions:** 1024
- **Cost:** ¥0.001 per 1K tokens (~$0.00014)
- **API:** https://cloud.tencent.com/product/hunyuan
- **Pros:** Good Chinese support
- **Cons:** Newer, less documentation

### 4. **Zhipu AI (智谱AI) - GLM**
- **Model:** embedding-2
- **Dimensions:** 1024
- **Cost:** ¥0.0005 per 1K tokens (~$0.00007)
- **API:** https://open.bigmodel.cn
- **Pros:** Very cheap, good Chinese support
- **Cons:** Smaller dimensions

### 5. **OpenAI via Proxy/VPN**
- **Pros:** Best quality, most proven
- **Cons:** Requires VPN, slower, may violate ToS
- **Not recommended** for production

### 6. **Self-hosted Models**
- **Models:** sentence-transformers, BGE (BAAI)
- **Dimensions:** 768-1024
- **Cost:** Free (compute only)
- **Pros:** No API costs, full control, works offline
- **Cons:** Need GPU server, maintenance overhead

**Popular Chinese models:**
- `BAAI/bge-large-zh-v1.5` (1024 dim) - Best for Chinese
- `shibing624/text2vec-base-chinese` (768 dim)

## 🎯 Recommendation for Your Use Case

### Option A: Alibaba DashScope (Recommended)
**Best for:** Production use in China

**Pros:**
- Fast and reliable in China
- Good Chinese language support
- Cheap (¥0.0007 per 1K tokens)
- 1536 dimensions (same as OpenAI)
- Easy integration

**Cons:**
- Less proven than OpenAI
- Smaller ecosystem

**Monthly cost estimate:**
- 6 existing posts × 1000 tokens = 6,000 tokens = ¥0.0042 (~$0.0006)
- 30 new/edited posts/month = 30,000 tokens = ¥0.021 (~$0.003)
- **Total: ~¥0.025/month (~$0.0035/month)** - essentially free

### Option B: Self-hosted BGE Model
**Best for:** Zero API costs, full control

**Pros:**
- No ongoing API costs
- Works offline
- Best Chinese language support (BAAI/bge-large-zh-v1.5)
- No rate limits

**Cons:**
- Need GPU server (or slow CPU inference)
- Maintenance overhead
- Initial setup complexity

**Cost:**
- One-time: GPU server setup
- Ongoing: Server costs (if cloud) or electricity (if local)

### Option C: Zhipu AI (Budget Option)
**Best for:** Minimal costs

**Pros:**
- Cheapest option (¥0.0005 per 1K tokens)
- Good Chinese support
- Easy API

**Cons:**
- Only 1024 dimensions (vs 1536)
- Less proven

## 📝 Updated POC Plan

I'll create POC scripts for:
1. **Alibaba DashScope** (recommended)
2. **Self-hosted BGE** (for comparison)

You can choose which one to test based on your preferences:
- Want simplicity + low cost? → DashScope
- Want zero API costs + full control? → Self-hosted BGE
- Want to test both? → I'll create both POCs

## 🔐 API Key Setup

### For DashScope:
1. Register at https://dashscope.console.aliyun.com
2. Get API key
3. Add to `.env`:
```
DASHSCOPE_API_KEY=sk-...
```

### For Self-hosted:
1. Install transformers: `npm install @xenova/transformers`
2. No API key needed
3. Model downloads automatically on first run

Which option would you like to test first?
