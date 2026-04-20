import { Router } from "express";
import { hashPassword } from "@better-auth/utils/password";
import { Role } from "@prisma/client";
import { createUserSchema } from "@helpdesk/core";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import prisma from "../db.js";

const router = Router();

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? "Validation failed" });
    return;
  }
  const { name, email, password } = result.data;

  const hashedPassword = await hashPassword(password);
  const now = new Date();
  const id = crypto.randomUUID();

  const user = await prisma.user.create({
    data: { id, name, email, role: Role.agent, emailVerified: true, createdAt: now, updatedAt: now },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
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

  res.status(201).json(user);
});

export default router;
