/**
 * Xiaomi MiMO API Discovery Script
 * Tests common endpoint patterns and model names
 */

import OpenAI from "openai";
import "dotenv/config";

const API_KEY = process.env.MIMO_API_KEY || "sk-c44ik5g6l03opaow0ucxr49xapw2mqf579ksqawe5ufg10er";

// Common endpoint patterns for Chinese AI providers
const ENDPOINTS_TO_TRY = [
  "https://api.miaoxing.ai/v1",
  "https://api.xiaomi.com/v1",
  "https://api.mimo.ai/v1",
  "https://open.bigmodel.cn/api/paas/v4", // Zhipu AI format
  "https://dashscope.aliyuncs.com/compatible-mode/v1", // Alibaba format
];

// Common model names
const MODELS_TO_TRY = [
  "mimo-embedding",
  "text-embedding",
  "embedding-v1",
  "embedding-2",
  "text-embedding-v1",
];

async function testEndpoint(baseURL: string, model: string) {
  const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: baseURL,
  });

  try {
    console.log(`Testing: ${baseURL} with model "${model}"`);
    const response = await client.embeddings.create({
      model: model,
      input: "测试文本",
      encoding_format: "float",
    });

    console.log(`✅ SUCCESS!`);
    console.log(`   Endpoint: ${baseURL}`);
    console.log(`   Model: ${model}`);
    console.log(`   Dimensions: ${response.data[0].embedding.length}`);
    console.log(`   Usage: ${JSON.stringify(response.usage)}`);
    return true;
  } catch (error: unknown) {
    const e = error as { status?: number; code?: string; message?: string };
    if (e.status === 401) {
      console.log(`   ❌ 401 Unauthorized - API key may be invalid`);
    } else if (e.status === 404) {
      console.log(`   ❌ 404 Not Found - Wrong endpoint or model`);
    } else if (e.code === "ENOTFOUND") {
      console.log(`   ❌ DNS Error - Endpoint doesn't exist`);
    } else {
      console.log(`   ❌ Error: ${e.message ?? String(error)}`);
    }
    return false;
  }
}

async function main() {
  console.log("=== Xiaomi MiMO API Discovery ===\n");
  console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}\n`);

  let found = false;

  for (const endpoint of ENDPOINTS_TO_TRY) {
    for (const model of MODELS_TO_TRY) {
      const success = await testEndpoint(endpoint, model);
      if (success) {
        found = true;
        console.log("\n=== Configuration Found ===");
        console.log("Add these to your .env file:");
        console.log(`EMBEDDING_API_KEY=${API_KEY}`);
        console.log(`EMBEDDING_BASE_URL=${endpoint}`);
        console.log(`EMBEDDING_MODEL=${model}`);
        return;
      }
      console.log(""); // Empty line between attempts
    }
  }

  if (!found) {
    console.log("\n❌ Could not find working configuration");
    console.log("\nPlease check:");
    console.log("1. Is the API key correct?");
    console.log("2. Do you have access to Xiaomi MiMO API?");
    console.log("3. Check Xiaomi's documentation for the correct endpoint");
    console.log("\nYou can also try manually with curl:");
    console.log(`curl -X POST "https://api.example.com/v1/embeddings" \\`);
    console.log(`  -H "Authorization: Bearer ${API_KEY}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"model":"mimo-embedding","input":"测试"}'`);
  }
}

main().catch(console.error);
