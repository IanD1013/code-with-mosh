import { execSync } from "child_process";
import dotenv from "dotenv";
import path from "path";

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, "../server/.env.test") });

  const serverDir = path.resolve(__dirname, "../server");
  const env = { ...process.env };

  console.log("Running migrations against test database...");
  execSync("npx prisma migrate deploy", { cwd: serverDir, env, stdio: "inherit" });

  console.log("Seeding test database...");
  execSync("npx tsx src/seed-test.ts", { cwd: serverDir, env, stdio: "inherit" });
}
