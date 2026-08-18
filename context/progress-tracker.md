# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Phase 7 Complete

## Current Goal

- Ready for subsequent phases (workspace shell, canvas tools, layout editing, and features).

## Completed

- Design system and UI primitive components (01-design-system.md)
- Base chrome components (top navbar and floating left sidebar shell) for the editor screen (02-editor.md)
- Clerk Authentication integration, redirects, and custom pages (03-auth.md)
- Project Dialogs & Editor Home (04-project-dialogs.md)
- Prisma Schema And Data Layer (05-prisma.md)
- Project REST API endpoints (06-project-apis.md)
- Wiring editor home UI to the real project APIs (07-wire-editor-home.md)

## In Progress

- None.

## Next Up

- Build the `/editor/[roomId]` workspace shell with server-side access checks (08-editor-workspace-shell.md)

## Open Questions

- None yet.

## Architecture Decisions

- Configured global Tailwind variables such that dark mode is the only and default styling on `:root` to enforce dark-only mode.
- Adopted Next.js 16 file convention replacing `middleware.ts` with `proxy.ts` at the root for routing protection and root redirections.
- Designed `useProjectDialogs` hook for centralized, client-side dialog states, input forms, and live slug parsing without server roundtrips.
- Implemented database client cached singleton (`lib/prisma.ts`) that dynamically branches on the connection string prefix, switching between Prisma Accelerate (for edge/serverless caching compatibility) and `@prisma/adapter-pg` driver adapter.
- Converted `app/editor/page.tsx` into a Server Component that handles initial authentication checks and fetches project lists directly via a database helper `lib/projects.ts`, avoiding client-side layout shifts and initial fetching delays.

## Session Notes

- shadcn/ui successfully integrated. Verified that all components import correctly, type check passes, and Next.js Turbopack build succeeds.
- Base Editor navbar (`components/editor/editor-navbar.tsx`) and floating project sidebar (`components/editor/project-sidebar.tsx`) implemented and integrated into the editor workspace (`app/editor/page.tsx`).
- Connected design system homepage to `/editor`. Verified that `npm run build` succeeds without TS/lint errors.
- Authentication Integration (03-auth.md) completed: installed `@clerk/ui`, wrapped root layout in `ClerkProvider` using customized dark theme properties derived from CSS variables, established default page route `/` protection and redirect rules in `proxy.ts`, designed professional 2-panel login/signup layouts, and added `UserButton` to the editor navbar. Compiled successfully and ESLint checks pass clean.
- Project Dialogs & Editor Home (04-project-dialogs.md) completed: created `useProjectDialogs` hook for modal trigger states and automatic lowercase-hyphen slug preview; integrated list views for owned and shared projects in the sidebar; built Create, Rename (prefilled name, autofocus, Enter submits), and Delete (destructive confirmation, no input) dialogs in `app/editor/page.tsx`; added responsive mobile scrim tap-to-close behavior. verified compilation and ESLint clean-passes.
- Prisma Schema and Data Layer (05-prisma.md) completed: created `prisma/models/project.prisma` containing the `Project` (indexes on `ownerId`/`createdAt`) and `ProjectCollaborator` (cascade delete relation to `Project`, unique constraint on `projectId`/`email`, indexes on `email` and `projectId`/`createdAt`) models. Built cached Prisma client singleton at `lib/prisma.ts` with branching for Accelerate vs adapter-pg. Ran first migration `init_project_models` successfully, generated Prisma client to `app/generated/prisma`, and verified that Next.js builds clean.
- Project REST API endpoints (06-project-apis.md) completed: Implemented CRUD REST API endpoints for projects at `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/[projectId]`, and `DELETE /api/projects/[projectId]` with authenticated Clerk user ID as `ownerId`. Added security validation returning 401 for unauthenticated calls and 403 for non-owner mutations. Defaulted missing names to `Untitled Project` and awaited params for dynamic route segment compatibility in Next.js 15/16. Verified that `npm run build` compiled clean.
- Wiring editor home UI (07-wire-editor-home.md) completed: Converted `app/editor/page.tsx` into a Server Component. Designed `useProjectActions` hook in `lib/hooks/use-project-actions.ts` that manages creation with unique 6-character suffix room IDs, project renaming, and deletion (handling workspace redirect and list refreshes). Created database helper `lib/projects.ts` to fetch owned and shared projects server-side. Created client-side interactive layout `components/editor/editor-home-client.tsx`. Updated `project-sidebar.tsx` to wrap items in next/link and support active highlights. Verification build passed successfully.



