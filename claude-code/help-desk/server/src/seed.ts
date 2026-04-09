import "dotenv/config";
import { hashPassword } from "@better-auth/utils/password";
import { Role } from "@prisma/client";
import prisma from "./db.js";

const email = process.env.ADMIN_EMAIL!;
const password = process.env.ADMIN_PASSWORD!;

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}

async function seed() {
  const hashedPassword = await hashPassword(password);
  const now = new Date();
  const id = crypto.randomUUID();

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: Role.admin },
    create: {
      id,
      email,
      name: "Admin",
      role: Role.admin,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  const existingAccount = await prisma.account.findFirst({
    where: { providerId: "credential", userId: user.id },
  });

  if (existingAccount) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: hashedPassword, updatedAt: now },
    });
  } else {
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

  console.log(`Seeded admin user: ${email}`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
