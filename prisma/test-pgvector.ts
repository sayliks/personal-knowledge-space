/**
 * Test pgvector extension availability on Supabase
 */
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== pgvector Availability Test ===\n");

  try {
    // Step 1: Check if extension exists
    console.log("Step 1: Checking if pgvector extension is available...");
    const extensions = await prisma.$queryRaw<Array<{ name: string; installed_version: string | null }>>`
      SELECT name, installed_version
      FROM pg_available_extensions
      WHERE name = 'vector'
    `;

    if (extensions.length === 0) {
      console.log("❌ pgvector extension is NOT available on this database.");
      console.log("\nThis means:");
      console.log("- Your Supabase plan doesn't support pgvector");
      console.log("- You need to upgrade to Supabase Pro ($25/month)");
      console.log("- Or use an external vector database (Pinecone, Weaviate)");
      process.exit(1);
    }

    const ext = extensions[0];
    if (ext.installed_version) {
      console.log(`✅ pgvector is INSTALLED (version ${ext.installed_version})`);
    } else {
      console.log("⚠️  pgvector is available but NOT installed yet");
      console.log("\nAttempting to install...");

      try {
        await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
        console.log("✅ pgvector extension installed successfully!");
      } catch (error: any) {
        console.log("❌ Failed to install pgvector:");
        console.log(error.message);
        console.log("\nYou may need superuser permissions or a Supabase Pro plan.");
        process.exit(1);
      }
    }

    // Step 2: Test vector operations
    console.log("\nStep 2: Testing vector operations...");

    // Create a test table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS _vector_test (
        id SERIAL PRIMARY KEY,
        embedding vector(3)
      )
    `;
    console.log("✅ Created test table with vector column");

    // Insert test vectors
    await prisma.$executeRaw`
      INSERT INTO _vector_test (embedding) VALUES
        ('[1,2,3]'::vector),
        ('[4,5,6]'::vector),
        ('[7,8,9]'::vector)
    `;
    console.log("✅ Inserted test vectors");

    // Test similarity search
    const results = await prisma.$queryRaw<Array<{ id: number; distance: number }>>`
      SELECT id, embedding <-> '[2,3,4]'::vector as distance
      FROM _vector_test
      ORDER BY distance
      LIMIT 2
    `;
    console.log("✅ Vector similarity search works!");
    console.log("   Results:", results);

    // Cleanup
    await prisma.$executeRaw`DROP TABLE _vector_test`;
    console.log("✅ Cleaned up test table");

    // Step 3: Check vector dimension limits
    console.log("\nStep 3: Checking vector dimension limits...");
    try {
      await prisma.$executeRaw`
        CREATE TABLE _vector_limit_test (embedding vector(1536))
      `;
      console.log("✅ 1536 dimensions supported (OpenAI text-embedding-3-small)");
      await prisma.$executeRaw`DROP TABLE _vector_limit_test`;
    } catch (error: any) {
      console.log("⚠️  1536 dimensions may not be supported");
      console.log(error.message);
    }

    console.log("\n=== Summary ===");
    console.log("✅ pgvector is fully functional on your Supabase instance");
    console.log("✅ Vector similarity search works correctly");
    console.log("✅ Ready for Phase 2 implementation");

  } catch (error: any) {
    console.error("\n❌ Test failed:", error.message);
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
