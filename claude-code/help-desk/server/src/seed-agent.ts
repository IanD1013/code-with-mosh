import "dotenv/config";
import { hashPassword } from "@better-auth/utils/password";
import { Role } from "@prisma/client";
import prisma from "./db.js";

async function seedAgent() {
  const now = new Date();
  const id = crypto.randomUUID();

  const user = await prisma.user.upsert({
    where: { email: "agent@example.com" },
    update: {},
    create: {
      id,
      email: "agent@example.com",
      name: "Agent",
      role: Role.agent,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { providerId: "credential", userId: user.id },
  });

  if (!existingAccount) {
    const hashedPassword = await hashPassword("password123");
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });
  }

  console.log("Seeded agent user: agent@example.com");
  await prisma.$disconnect();
}

seedAgent().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
