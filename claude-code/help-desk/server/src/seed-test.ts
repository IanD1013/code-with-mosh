import "dotenv/config";
import { hashPassword } from "@better-auth/utils/password";
import prisma from "./db.js";

const users = [
  { email: "admin@example.com", password: "password123", name: "Admin", role: "admin" as const },
  { email: "agent@example.com", password: "password123", name: "Agent", role: "agent" as const },
];

async function seedTest() {
  // Wipe existing data so each test run starts clean
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const now = new Date();

  for (const { email, password, name, role } of users) {
    const id = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: { id, email, name, role, emailVerified: true, createdAt: now, updatedAt: now },
    });

    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: id,
        providerId: "credential",
        userId: id,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  console.log("Test database seeded.");
  await prisma.$disconnect();
}

seedTest().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
