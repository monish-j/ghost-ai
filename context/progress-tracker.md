# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Phase 5 Complete

## Current Goal

- Ready for subsequent phases (canvas tools, layout editing, and features).

## Completed

- Design system and UI primitive components (01-design-system.md)
- Base chrome components (top navbar and floating left sidebar shell) for the editor screen (02-editor.md)
- Clerk Authentication integration, redirects, and custom pages (03-auth.md)
- Project Dialogs & Editor Home (04-project-dialogs.md)
- Prisma Schema And Data Layer (05-prisma.md)

## In Progress

- None.

## Next Up

- Canvas interactions and node styling (subsequent spec phases)

## Open Questions

- None yet.

## Architecture Decisions

- Configured global Tailwind variables such that dark mode is the only and default styling on `:root` to enforce dark-only mode.
- Adopted Next.js 16 file convention replacing `middleware.ts` with `proxy.ts` at the root for routing protection and root redirections.
- Designed `useProjectDialogs` hook for centralized, client-side dialog states, input forms, and live slug parsing without server roundtrips.
- Implemented database client cached singleton (`lib/prisma.ts`) that dynamically branches on the connection string prefix, switching between Prisma Accelerate (for edge/serverless caching compatibility) and `@prisma/adapter-pg` driver adapter.

## Session Notes

- shadcn/ui successfully integrated. Verified that all components import correctly, type check passes, and Next.js Turbopack build succeeds.
- Base Editor navbar (`components/editor/editor-navbar.tsx`) and floating project sidebar (`components/editor/project-sidebar.tsx`) implemented and integrated into the editor workspace (`app/editor/page.tsx`).
- Connected design system homepage to `/editor`. Verified that `npm run build` succeeds without TS/lint errors.
- Authentication Integration (03-auth.md) completed: installed `@clerk/ui`, wrapped root layout in `ClerkProvider` using customized dark theme properties derived from CSS variables, established default page route `/` protection and redirect rules in `proxy.ts`, designed professional 2-panel login/signup layouts, and added `UserButton` to the editor navbar. Compiled successfully and ESLint checks pass clean.
- Project Dialogs & Editor Home (04-project-dialogs.md) completed: created `useProjectDialogs` hook for modal trigger states and automatic lowercase-hyphen slug preview; integrated list views for owned and shared projects in the sidebar; built Create, Rename (prefilled name, autofocus, Enter submits), and Delete (destructive confirmation, no input) dialogs in `app/editor/page.tsx`; added responsive mobile scrim tap-to-close behavior. verified compilation and ESLint clean-passes.
- Prisma Schema and Data Layer (05-prisma.md) completed: created `prisma/models/project.prisma` containing the `Project` (indexes on `ownerId`/`createdAt`) and `ProjectCollaborator` (cascade delete relation to `Project`, unique constraint on `projectId`/`email`, indexes on `email` and `projectId`/`createdAt`) models. Built cached Prisma client singleton at `lib/prisma.ts` with branching for Accelerate vs adapter-pg. Ran first migration `init_project_models` successfully, generated Prisma client to `app/generated/prisma`, and verified that Next.js builds clean.


