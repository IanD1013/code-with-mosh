import "dotenv/config";
import prisma from "./db.js";

async function reset() {
  await prisma.user.updateMany({
    where: { email: "agent@example.com" },
    data: { name: "Agent" },
  });

  const { count } = await prisma.user.deleteMany({
    where: { email: { notIn: ["admin@example.com", "agent@example.com"] } },
  });

  console.log(`Reset done. Deleted ${count} leftover test user(s).`);
  await prisma.$disconnect();
}

reset().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
