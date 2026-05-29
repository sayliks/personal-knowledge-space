import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function updateAdminPassword(newPassword: string) {
  const email = process.env.ADMIN_EMAIL || "sayliks@outlook.com";
  const hash = await bcrypt.hash(newPassword, 12);

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { passwordHash: hash },
    });

    console.log(`✅ Password updated for ${user.email}`);
  } catch (error) {
    console.error(`❌ Error updating password: ${error}`);
    throw error;
  }
}

const password = process.argv[2];
if (!password) {
  console.error("❌ Usage: npx tsx prisma/update-password.ts YOUR_NEW_PASSWORD");
  console.error('   Example: npx tsx prisma/update-password.ts "MyNewPassword123"');
  process.exit(1);
}

updateAdminPassword(password)
  .then(() => {
    console.log("✅ Done!");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
