DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('admin', 'agent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'agent'::"Role";
