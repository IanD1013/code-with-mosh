# Helpdesk - AI-Powered Ticket Management System

## Project Overview

A ticket management system that uses AI to classify, respond to, and route support tickets. See `project-scope.md` for full requirements and `implementation-plan.md` for phased task breakdown.

## Tech Stack

- **Frontend**: React + TypeScript + Vite (port 5173)
- **Backend**: Express + TypeScript + Node.js/tsx (port 3000)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Claude API (Anthropic)
- **Auth**: Better Auth (email/password, database sessions)
- **UI**: shadcn/ui (Radix) + Tailwind CSS v4

## Project Structure

```
/client   - React frontend (Vite)
/server   - Express backend
/core     - Shared code (Zod schemas, types) — imported as @helpdesk/core
/e2e      - Playwright end-to-end tests
```

## Development

```bash
# Start server
cd server && npm run dev

# Start client
cd client && npm run dev
```

The client proxies `/api/*` requests to the server via Vite config.


## Key Conventions

- Server uses Node.js + tsx; client uses npm
- Use TypeScript throughout
- Use **Zod** for all request body validation in server routes (`safeParse` → 400 on failure)
- Use the `Role` enum from `@prisma/client` for role values — never hardcode role strings
- Server runs **Express 5**, which automatically forwards rejected async handler promises to error middleware — no try/catch needed in route handlers. Add a global error handler at the bottom of `index.ts` for cases that need custom status codes (e.g. Prisma P2002 → 409)
- **Shared Zod schemas** live in `core/src/schemas/` and are exported from `@helpdesk/core`. Define schemas there and import them in both client and server — never duplicate a schema across packages
- Use context7 MCP server to fetch up-to-date documentation for libraries
- **Always use the `playwright-e2e-writer` agent to write E2E tests** — never write tests inline. Invoke it after completing any user-facing feature. It has full knowledge of the test setup, seed data, and testing conventions for this project.

## Frontend: Component Tests

- **Vitest** + **React Testing Library** + **MSW** for component tests in `client/`
- Test files live next to the component: `src/pages/Foo.tsx` → `src/pages/Foo.test.tsx`
- Shared test utilities:
  - `src/test/setup.ts` — loads `@testing-library/jest-dom` matchers (runs before every test)
  - `src/test/render.tsx` — `renderWithProviders()` wraps the component in `QueryClientProvider` + `MemoryRouter`
- Mock `../lib/auth-client` with `vi.mock` to control session state
- Mock API calls with MSW (`setupServer` / `http.get` / `HttpResponse`) — never mock axios directly
- Run tests: `npm test` (single run) or `npm run test:watch` (watch mode) from `client/`

## Frontend: Data Fetching

- Use **axios** for all HTTP requests (`withCredentials: true` for cookie-based auth)
- Use **TanStack Query** (`@tanstack/react-query`) for all server state — no raw `useEffect`/`useState` for fetching
- `QueryClientProvider` is set up in `client/src/main.tsx`

## Frontend: UI

- **shadcn/ui** components live in `client/src/components/ui/`
- Add new components manually (shadcn CLI tries to use bun which segfaults):
  1. Install any Radix peer deps with `npm install` in `/client`
  2. Copy the component source into `client/src/components/ui/`
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (no `tailwind.config.js`)
- Theme CSS variables are defined in `client/src/index.css` using OKLCH color space
- The `cn()` utility is at `client/src/lib/utils.ts`
- Path alias `@/` resolves to `client/src/`

## Authentication

Auth is handled by **Better Auth** with email/password only. Sign-up is disabled — users are created via the seed script.

### Server (`server/src/auth.ts`)
- Prisma adapter connected to PostgreSQL
- `emailAndPassword` enabled, `disableSignUp: true`
- Trusted origin: `http://localhost:5173` (or `CLIENT_URL` env var)
- Users have an additional `role` field (default: `"agent"`)
- Auth routes mounted at `/api/auth/*` via `toNodeHandler(auth)`

### Client (`client/src/lib/auth-client.ts`)
- `createAuthClient()` from `better-auth/react` with `inferAdditionalFields` plugin
- `inferAdditionalFields({ user: { role: { type: "string" } } })` from `better-auth/client/plugins` is required to expose `role` on the session user type
- Exports: `signIn`, `signOut`, `useSession`
- `signIn.email({ email, password })` returns `{ error }` on failure
- Session accessed via `useSession()` hook — `data.user` contains user info including `role`

### Server Middleware (`server/src/middleware/auth.ts`)
- `requireAuth` — reads the Better Auth session from request headers; responds 401 if missing; attaches session to `res.locals.session`
- `requireAdmin` — must follow `requireAuth` or be used standalone; responds 403 if role is not `"admin"`
- **Every new API route must use one of these.** Pattern:
  ```ts
  app.get("/api/users", requireAuth, requireAdmin, handler);
  app.get("/api/tickets", requireAuth, handler);
  ```

### Route Guards (`client/src/App.tsx`)
- `ProtectedRoute` — redirects to `/login` if not authenticated
- `AdminRoute` — redirects to `/login` if not authenticated, to `/` if role is not `"admin"`
- `GuestRoute` — redirects to `/` if already authenticated

### Seeding
Run `cd server && npm run seed` to create the initial admin user.
To create additional users, write a one-off script in `server/src/` and run with `npx tsx`.
