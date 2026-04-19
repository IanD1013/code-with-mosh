---
name: Server startup failure with npx tsx on Node.js v24
description: The playwright.config.ts webServer command uses npx tsx to start the Express server, which fails under Node.js v24 due to ESM named export issues with Express. This is a pre-existing infrastructure issue.
type: feedback
---

The `playwright.config.ts` webServer starts the backend with `npx tsx --watch src/index.ts`. Under Node.js v24 this produces:

```
SyntaxError: The requested module 'express' does not provide an export named 'NextFunction'
```

This fails for ALL tests (existing auth.spec.ts and new specs alike) when the servers are not already running. The server is built for Bun and runs correctly with `bun run dev`.

**Why:** The Express server uses Bun as its runtime. `npx tsx` runs it under Node.js instead, which in Node v24 does not handle Express's ESM-style named type exports the same way Bun does.

**How to apply:** When running tests fails at the WebServer startup step, it is a pre-existing infrastructure issue — not a problem with the test file itself. Verify by checking that `auth.spec.ts` fails the same way. The tests are correct; the runner environment needs Bun or pre-started servers.
