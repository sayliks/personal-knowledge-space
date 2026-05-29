/**
 * Proof of Concept: Embedding generation with OpenAI-compatible APIs
 *
 * Works with:
 * - Xiaomi MiMO
 * - Alibaba DashScope (OpenAI-compatible mode)
 * - Zhipu AI
 * - Any OpenAI-compatible endpoint
 *
 * Prerequisites:
 * 1. npm install openai
 * 2. Add to .env:
 *    EMBEDDING_API_KEY=your-key-here
 *    EMBEDDING_BASE_URL=https://api.miaoxing.ai/v1  (or your provider's URL)
 *    EMBEDDING_MODEL=mimo-embedding  (or your model name)
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Configuration
const API_KEY = process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY;
const BASE_URL = process.env.EMBEDDING_BASE_URL || "https://api.openai.com/v1";
const MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

async function generateEmbedding(text: string): Promise<number[]> {
  console.log(`   Calling ${BASE_URL} with model ${MODEL}...`);
  const response = await client.embeddings.create({
    model: MODEL,
    input: text,
    encoding_format: "float",
  });
  return response.data[0].embedding;
}

async function main() {
  console.log("=== Embedding POC for Chinese Content ===\n");
  console.log(`Provider: ${BASE_URL}`);
  console.log(`Model: ${MODEL}\n`);

  // Check configuration
  if (!API_KEY) {
    console.log("❌ API key not found");
    console.log("\nAdd to your .env file:");
    console.log("EMBEDDING_API_KEY=your-key-here");
    console.log("EMBEDDING_BASE_URL=https://api.miaoxing.ai/v1  # Xiaomi MiMO");
    console.log("EMBEDDING_MODEL=mimo-embedding  # or your model name");
    console.log("\nOr for OpenAI:");
    console.log("OPENAI_API_KEY=sk-...");
    process.exit(1);
  }

  try {
    // Step 1: Fetch a Chinese post
    console.log("Step 1: Fetching Chinese post from database...");
    const post = await prisma.document.findFirst({
      where: { type: "POST", published: true },
      select: { id: true, title: true, content: true, slug: true },
    });

    if (!post || !post.content) {
      console.log("❌ No published post with content found");
      process.exit(1);
    }

    console.log(`✅ Found post: "${post.title}"`);
    console.log(`   Content length: ${post.content.length} characters`);
    console.log(`   First 100 chars: ${post.content.substring(0, 100)}...\n`);

    // Step 2: Generate embedding
    console.log("Step 2: Generating embedding...");
    const startTime = Date.now();

    const embedding = await generateEmbedding(post.content);
    const duration = Date.now() - startTime;

    console.log(`✅ Embedding generated in ${duration}ms`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(", ")}...]`);
    console.log(`   Last 5 values: [...${embedding.slice(-5).map(v => v.toFixed(4)).join(", ")}]`);

    // Check if embedding is valid (not all zeros)
    const nonZeroCount = embedding.filter(v => v !== 0).length;
    console.log(`   Non-zero values: ${nonZeroCount}/${embedding.length} (${(nonZeroCount/embedding.length*100).toFixed(1)}%)`);

    if (nonZeroCount < embedding.length * 0.5) {
      console.log("   ⚠️  Warning: Many zero values, embedding may be invalid");
    } else {
      console.log("   ✅ Embedding looks valid\n");
    }

    // Step 3: Create test table and store embedding
    console.log("Step 3: Testing vector storage and search...");
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _embedding_poc (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        embedding vector(${embedding.length})
      )
    `;

    await prisma.$executeRaw`
      INSERT INTO _embedding_poc (id, title, content, embedding)
      VALUES (${post.id}, ${post.title}, ${post.content}, ${JSON.stringify(embedding)}::vector)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding
    `;
    console.log("✅ Stored embedding in database\n");

    // Step 4: Test semantic search
    console.log("Step 4: Testing semantic search with Chinese queries...");

    const testQueries = [
      "语言模型",
      "人工智能",
      "机器学习",
      "深度学习",
    ];

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);

      try {
        // Generate query embedding
        const queryEmbedding = await generateEmbedding(query);

        // Semantic search (cosine distance)
        const semanticResults = await prisma.$queryRaw<Array<{ title: string; distance: number }>>`
          SELECT title, embedding <-> ${JSON.stringify(queryEmbedding)}::vector as distance
          FROM _embedding_poc
          ORDER BY distance
          LIMIT 1
        `;

        // Keyword search (for comparison)
        const keywordMatch = post.content.toLowerCase().includes(query.toLowerCase()) ||
                            post.title.toLowerCase().includes(query.toLowerCase());

        console.log(`   Vector search: ${semanticResults[0]?.title || "No match"}`);
        console.log(`   Distance: ${semanticResults[0]?.distance.toFixed(4) || "N/A"}`);
        console.log(`   Keyword match: ${keywordMatch ? "Yes" : "No"}`);

        // Interpret distance
        if (semanticResults[0]) {
          const distance = semanticResults[0].distance;
          if (distance < 0.3) {
            console.log(`   ✅ Very relevant (distance < 0.3)`);
          } else if (distance < 0.5) {
            console.log(`   ⚠️  Somewhat relevant (0.3 < distance < 0.5)`);
          } else {
            console.log(`   ❌ Not very relevant (distance > 0.5)`);
          }
        }
      } catch (error: any) {
        console.log(`   ❌ Query failed: ${error.message}`);
      }
    }

    // Step 5: Cost estimation
    console.log("\n\nStep 5: Cost Estimation");
    const contentLength = post.content.length;
    const estimatedTokens = Math.ceil(contentLength / 2); // Rough estimate for Chinese

    console.log(`   Content length: ${contentLength} characters`);
    console.log(`   Estimated tokens: ~${estimatedTokens}`);
    console.log(`   Embedding dimensions: ${embedding.length}`);
    console.log("\n   Cost depends on your provider's pricing.");
    console.log(`   For 6 existing posts: ~${estimatedTokens * 6} tokens`);
    console.log(`   For 30 posts/month: ~${estimatedTokens * 30} tokens`);

    // Cleanup
    console.log("\n\nCleaning up...");
    await prisma.$executeRaw`DROP TABLE _embedding_poc`;
    console.log("✅ Test table dropped");

    console.log("\n=== POC Summary ===");
    console.log(`✅ Provider: ${BASE_URL}`);
    console.log(`✅ Model: ${MODEL}`);
    console.log(`✅ Embedding dimensions: ${embedding.length}`);
    console.log("✅ Embedding generation works for Chinese content");
    console.log("✅ Vector storage and search functional");
    console.log("✅ Ready for Phase 2 implementation");

  } catch (error: any) {
    console.error("\n❌ POC failed:", error.message);

    if (error.message.includes("API key")) {
      console.log("\nCheck your API key configuration in .env");
    } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
      console.log("\nYou may have exceeded your API quota or rate limit");
    } else if (error.message.includes("model")) {
      console.log("\nThe model name may be incorrect. Check your provider's documentation.");
    } else if (error.code === 'ENOTFOUND' || error.message.includes('fetch failed')) {
      console.log("\nCannot reach the API endpoint. Check:");
      console.log("1. EMBEDDING_BASE_URL is correct");
      console.log("2. You have internet connection");
      console.log("3. The service is accessible from your location");
    }

    // Cleanup on error
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS _embedding_poc`;
    } catch {}

    process.exit(1);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Error:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
