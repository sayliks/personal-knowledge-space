# Xiaomi MiMO Embedding API

## Overview
Xiaomi MiMO (小米大模型) provides embedding services through their AI platform.

## API Details

**Endpoint:** https://api.miaoxing.ai/v1/embeddings (or similar)
**Model:** MiMO-Embedding (需要确认具体模型名称)

## Setup

### 1. Get API Key
1. Register at Xiaomi AI Platform
2. Create API key
3. Add to `.env`:
```
MIMO_API_KEY=your-key-here
```

### 2. Install SDK (if available)
```bash
npm install @xiaomi/mimo-sdk
# or use standard OpenAI-compatible client
```

## API Format

Xiaomi MiMO typically follows OpenAI-compatible API format:

```typescript
POST https://api.miaoxing.ai/v1/embeddings
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "model": "mimo-embedding",
  "input": "你的文本内容"
}

Response:
{
  "data": [{
    "embedding": [0.1, 0.2, ...],
    "index": 0
  }],
  "model": "mimo-embedding",
  "usage": {
    "prompt_tokens": 10,
    "total_tokens": 10
  }
}
```

## Pricing
(需要查询官方定价)
- Estimated: ¥0.001 - 0.002 per 1K tokens
- Free tier may be available

## Dimensions
(需要确认)
- Likely: 1024 or 1536 dimensions

## Notes
- Good Chinese language support (小米专注中文市场)
- May require mainland China phone number for registration
- API documentation: https://developers.miaoxing.ai (需要确认实际URL)
