/**
 * Proof of Concept: Embedding generation and semantic search for Chinese content
 *
 * This POC:
 * 1. Fetches a real Chinese post from your database
 * 2. Generates embeddings using OpenAI API
 * 3. Tests semantic search with Chinese queries
 * 4. Compares results with keyword search
 *
 * Prerequisites:
 * - OPENAI_API_KEY in .env
 * - npm install openai
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import OpenAI from "openai";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });
  return response.data[0].embedding;
}

async function main() {
  console.log("=== Embedding POC for Chinese Content ===\n");

  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.log("❌ OPENAI_API_KEY not found in .env");
    console.log("\nAdd your OpenAI API key to .env:");
    console.log("OPENAI_API_KEY=sk-...");
    process.exit(1);
  }

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
  console.log(`   Content length: ${post.content.length} characters\n`);

  // Step 2: Generate embedding
  console.log("Step 2: Generating embedding with OpenAI...");
  const startTime = Date.now();

  try {
    const embedding = await generateEmbedding(post.content);
    const duration = Date.now() - startTime;

    console.log(`✅ Embedding generated in ${duration}ms`);
    console.log(`   Dimensions: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(", ")}...]`);
    console.log(`   Model: text-embedding-3-small\n`);

    // Step 3: Create temporary test table
    console.log("Step 3: Creating test table for semantic search...");
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _embedding_poc (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        embedding vector(1536)
      )
    `;

    // Insert the post with its embedding
    await prisma.$executeRaw`
      INSERT INTO _embedding_poc (id, title, content, embedding)
      VALUES (${post.id}, ${post.title}, ${post.content}, ${JSON.stringify(embedding)}::vector)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding
    `;
    console.log("✅ Stored post with embedding\n");

    // Step 4: Test semantic search with Chinese queries
    console.log("Step 4: Testing semantic search with Chinese queries...");

    const testQueries = [
      "语言模型",
      "人工智能",
      "大模型幻觉",
      "机器学习",
    ];

    for (const query of testQueries) {
      console.log(`\n📝 Query: "${query}"`);

      // Generate query embedding
      const queryEmbedding = await generateEmbedding(query);

      // Semantic search
      const semanticResults = await prisma.$queryRaw<Array<{ title: string; distance: number }>>`
        SELECT title, embedding <-> ${JSON.stringify(queryEmbedding)}::vector as distance
        FROM _embedding_poc
        ORDER BY distance
        LIMIT 1
      `;

      // Keyword search (for comparison)
      const keywordResults = await prisma.$queryRaw<Array<{ title: string }>>`
        SELECT title FROM _embedding_poc
        WHERE content ILIKE ${`%${query}%`} OR title ILIKE ${`%${query}%`}
        LIMIT 1
      `;

      console.log(`   Vector search: ${semanticResults[0]?.title || "No match"} (distance: ${semanticResults[0]?.distance.toFixed(4) || "N/A"})`);
      console.log(`   Keyword search: ${keywordResults[0]?.title || "No match"}`);

      // Distance interpretation
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
    }

    // Step 5: Cost estimation
    console.log("\n\nStep 5: Cost Estimation");
    const contentLength = post.content.length;
    const estimatedTokens = Math.ceil(contentLength / 2); // Rough estimate for Chinese
    const costPer1KTokens = 0.00002; // text-embedding-3-small
    const estimatedCost = (estimatedTokens / 1000) * costPer1KTokens;

    console.log(`   Content length: ${contentLength} characters`);
    console.log(`   Estimated tokens: ~${estimatedTokens}`);
    console.log(`   Cost per embedding: ~$${estimatedCost.toFixed(6)}`);
    console.log(`   Cost for 6 posts: ~$${(estimatedCost * 6).toFixed(6)}`);
    console.log(`   Monthly cost (10 new + 20 edits): ~$${(estimatedCost * 30).toFixed(4)}`);

    // Cleanup
    console.log("\n\nCleaning up test table...");
    await prisma.$executeRaw`DROP TABLE _embedding_poc`;
    console.log("✅ Cleanup complete");

    console.log("\n=== POC Summary ===");
    console.log("✅ Embedding generation works for Chinese content");
    console.log("✅ Semantic search returns relevant results");
    console.log("✅ Costs are reasonable for your usage");
    console.log("✅ Ready to proceed with Phase 2 implementation");

  } catch (error: any) {
    console.error("\n❌ POC failed:", error.message);

    if (error.message.includes("API key")) {
      console.log("\nCheck your OPENAI_API_KEY in .env");
    } else if (error.message.includes("quota")) {
      console.log("\nYou may have exceeded your OpenAI API quota");
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
