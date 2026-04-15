import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) throw new Error("BETTER_AUTH_SECRET environment variable is required");

export const auth = betterAuth({
  secret,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:5173"],
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "agent", input: false },
    },
  },
});
