import { Router, type Response } from "express";
import { hashPassword } from "@better-auth/utils/password";
import { Role } from "@prisma/client";
import { createUserSchema, editUserSchema } from "@helpdesk/core";
import { type ZodSchema } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import prisma from "../db.js";

const router = Router();

function validate<T>(schema: ZodSchema<T>, body: unknown, res: Response): T | null {
  const result = schema.safeParse(body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? "Validation failed" });
    return null;
  }
  return result.data;
}

router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const data = validate(createUserSchema, req.body, res);
  if (!data) return;
  const { name, email, password } = data;

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

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const data = validate(editUserSchema, req.body, res);
  if (!data) return;
  const { name, email, password } = data;
  const now = new Date();

  const user = await prisma.user.update({
    where: { id: req.params["id"] },
    data: { name, email, updatedAt: now },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (password) {
    const hashedPassword = await hashPassword(password);
    await prisma.account.updateMany({
      where: { userId: user.id, providerId: "credential" },
      data: { password: hashedPassword, updatedAt: now },
    });
  }

  res.json(user);
});

export default router;
