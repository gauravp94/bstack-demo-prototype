# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router lives in `src/app` (routes, layouts, API handlers). Global styles in `src/app/globals.css`.
- Reusable UI lives in `src/components`; stateful logic in `src/hooks`; shared helpers and services in `src/lib`; shared types/interfaces in `src/types`.
- Database schema and seed scripts sit under `prisma/` (`schema.prisma`, `seed.ts`); run a migration/seed after schema edits.
- Static assets are in `public/`. Root configs: `next.config.js`, `tailwind.config.js`, `tsconfig.json`, `postcss.config.js`.

## Build, Test, and Development Commands
- `npm run dev` — start the dev server on `localhost:3000` (requires `.env` with `DATABASE_URL`, `GEMINI_API_KEY`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`).
- `npm run build` / `npm run start` — production build and serve.
- `npm run lint` — Next.js/ESLint checks; fix warnings before committing.
- `npm run db:push` — apply Prisma schema to the configured Postgres database; follow with `npx prisma generate` if the client is stale.
- `npm run db:seed` — load demo data (creates PM/Dev/Designer accounts).
- `npm run db:studio` — open Prisma Studio for data inspection.

## Coding Style & Naming Conventions
- TypeScript-first, React function components. Prefer PascalCase for components (`MyPanel.tsx`), camelCase for hooks/utilities (`useTimeline.ts`), and kebab/pascal matching the route for files in `src/app`.
- Use 2-space indentation; keep components small and colocate UI + logic when tightly coupled.
- TailwindCSS for styling; keep utility class lists readable (group by layout/spacing/typography). Put shared variants/helpers in `src/lib` when reused.
- Run `npm run lint` before pushing; address accessibility warnings (aria labels, focus handling) flagged by Next.js ESLint.

## Testing Guidelines
- No automated test suite yet; add tests colocated as `*.test.ts(x)` using React Testing Library when introducing new complex UI or data transforms.
- Minimum expectation today: run `npm run lint` and perform a manual smoke pass (login with seeded accounts, comment flow, approval gating) before opening a PR.
- For data changes, verify `npm run db:push && npm run db:seed` on a fresh database.

## Commit & Pull Request Guidelines
- No existing convention is enforced; default to Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) to keep history scannable.
- Reference relevant issues/tasks in PR descriptions. Summarize the change, note schema or env-var impacts, and attach screenshots/GIFs for UI changes.
- Include a short test plan (commands run, manual scenarios) in the PR body. Keep PRs focused; avoid bundling unrelated changes.

## Security & Configuration Tips
- Keep secrets out of Git; manage `.env` locally. Rotate `JWT_SECRET` and `GEMINI_API_KEY` if exposed.
- When altering Prisma schema, call out breaking changes and provide migration steps for other contributors.
- Avoid committing large seed data files in `prisma/` unless essential; prefer small fixtures that cover core flows.
