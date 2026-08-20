# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Phase 18 Complete

## Current Goal

- Ready for subsequent collaborative features (presence, avatars, comments).

## Completed

- Design system and UI primitive components (01-design-system.md)
- Base chrome components (top navbar and floating left sidebar shell) for the editor screen (02-editor.md)
- Clerk Authentication integration, redirects, and custom pages (03-auth.md)
- Project Dialogs & Editor Home (04-project-dialogs.md)
- Prisma Schema And Data Layer (05-prisma.md)
- Project REST API endpoints (06-project-apis.md)
- Wiring editor home UI to the real project APIs (07-wire-editor-home.md)
- Workspace shell layout and server-side access checks (08-editor-workspace-shell.md)
- Project share dialog and collaborator management (09-share-dialog.md)
- Set up Liveblocks real-time infrastructure (10-liveblocks-setup.md)
- Implement base collaborative canvas (11-base-canvas.md)
- Create shape panel (12-shape-panel.md)
- Node shape rendering (13-node-shape.md)
- Resizing and inline label editing for canvas nodes (14-node-editing.md)
- Node color toolbar (15-node-color-toolbar.md)
- Edge behavior (16-edge-behavior.md)
- Canvas ergonomics (17-canvas-ergonomics.md)
- Starter templates (18-starter-templates.md)

## In Progress

- None.

## Next Up

- Presence and collaboration polish.

## Open Questions

- None yet.

## Architecture Decisions

- Configured global Tailwind variables such that dark mode is the only and default styling on `:root` to enforce dark-only mode.
- Adopted Next.js 16 file convention replacing `middleware.ts` with `proxy.ts` at the root for routing protection and root redirections.
- Designed `useProjectDialogs` hook for centralized, client-side dialog states, input forms, and live slug parsing without server roundtrips.
- Implemented database client cached singleton (`lib/prisma.ts`) that dynamically branches on the connection string prefix, switching between Prisma Accelerate (for edge/serverless caching compatibility) and `@prisma/adapter-pg` driver adapter.
- Converted `app/editor/page.tsx` into a Server Component that handles initial authentication checks and fetches project lists directly via a database helper `lib/projects.ts`, avoiding client-side layout shifts and initial fetching delays.
- Isolated server-side security lookup helpers (`lib/project-access.ts`) to extract active Clerk identities and validate database room ownership/collaborator list, keeping route page layouts lean and testable.
- Integrated `@clerk/nextjs/server` `createClerkClient` in Route Handlers to dynamically retrieve collaborator avatars and full display names via parallelized, batch-filtering searches on user emails.
- Configured Liveblocks server client with a fallback mock secret during module evaluation to prevent static analysis crashes in Next.js build tasks.
- Adopted Liveblocks Access Tokens (prepared server-side via `liveblocks.prepareSession`) dynamically validated against database ownership and collaborator memberships, utilizing PostgreSQL as the access authority and avoiding permission syncing overhead.
- Devised a Lightweight Diagram Preview Renderer that calculates bounding boxes of template nodes and draws simplified SVG shape nodes and linear edges scaled/centered inside a fixed 3:2 viewport, completely avoiding loading a heavy React Flow instance for static previews.
- Structured the collaborative template import using Liveblocks `useMutation` to atomically clear and replace the entire room's nodes and edges maps inside a single transaction, preventing inconsistent state broadcasts and race conditions.

## Session Notes

- shadcn/ui successfully integrated. Verified that all components import correctly, type check passes, and Next.js Turbopack build succeeds.
- Base Editor navbar (`components/editor/editor-navbar.tsx`) and floating project sidebar (`components/editor/project-sidebar.tsx`) implemented and integrated into the editor workspace (`app/editor/page.tsx`).
- Connected design system homepage to `/editor`. Verified that `npm run build` succeeds without TS/lint errors.
- Authentication Integration (03-auth.md) completed: installed `@clerk/ui`, wrapped root layout in `ClerkProvider` using customized dark theme properties derived from CSS variables, established default page route `/` protection and redirect rules in `proxy.ts`, designed professional 2-panel login/signup layouts, and added `UserButton` to the editor navbar. Compiled successfully and ESLint checks pass clean.
- Project Dialogs & Editor Home (04-project-dialogs.md) completed: created `useProjectDialogs` hook for modal trigger states and automatic lowercase-hyphen slug preview; integrated list views for owned and shared projects in the sidebar; built Create, Rename (prefilled name, autofocus, Enter submits), and Delete (destructive confirmation, no input) dialogs in `app/editor/page.tsx`; added responsive mobile scrim tap-to-close behavior. verified compilation and ESLint clean-passes.
- Prisma Schema and Data Layer (05-prisma.md) completed: created `prisma/models/project.prisma` containing the `Project` (indexes on `ownerId`/`createdAt`) and `ProjectCollaborator` (cascade delete relation to `Project`, unique constraint on `projectId`/`email`, indexes on `email` and `projectId`/`createdAt`) models. Built cached Prisma client singleton at `lib/prisma.ts` with branching for Accelerate vs adapter-pg. Ran first migration `init_project_models` successfully, generated Prisma client to `app/generated/prisma`, and verified that Next.js builds clean.
- Project REST API endpoints (06-project-apis.md) completed: Implemented CRUD REST API endpoints for projects at `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/[projectId]`, and `DELETE /api/projects/[projectId]` with authenticated Clerk user ID as `ownerId`. Added security validation returning 401 for unauthenticated calls and 403 for non-owner mutations. Defaulted missing names to `Untitled Project` and awaited params for dynamic route segment compatibility in Next.js 15/16. Verified that `npm run build` compiled clean.
- Wiring editor home UI (07-wire-editor-home.md) completed: Converted `app/editor/page.tsx` into a Server Component. Designed `useProjectActions` hook in `lib/hooks/use-project-actions.ts` that manages creation with unique 6-character suffix room IDs, project renaming, and deletion (handling workspace redirect and list refreshes). Created database helper `lib/projects.ts` to fetch owned and shared projects server-side. Created client-side interactive layout `components/editor/editor-home-client.tsx`. Updated `project-sidebar.tsx` to wrap items in next/link and support active highlights. Verification build passed successfully.
- Workspace Shell Setup (08-editor-workspace-shell.md) completed: Created server-side access helpers (`lib/project-access.ts`) supporting Clerk auth identity resolution and database-driven ownership/collaboration checks. Built custom glassmorphic `WorkspaceNavbar` (showing active project name, share buttons, AI side-panel toggles) and `EditorWorkspaceClient` wrapper managing full-viewport grids, left `ProjectSidebar` active highlighting, right AI Chat sidebar transitions, and floating project action modals. Created dynamic Server Component route `/editor/[roomId]/page.tsx` and custom `AccessDenied` view for unauthorized access or non-existent rooms. Next.js build and TypeScript validation checked successfully.
- Project Share Dialog (09-share-dialog.md) completed: Implemented a robust `/api/projects/[projectId]/collaborators` REST endpoint supporting GET (listing with Clerk batch data enrichment), POST (invitation by email with self-invite/duplicate safety validation), and DELETE (removal by ID or email). Enforced project ownership checking on invite and delete requests server-side. Created a beautiful, fully functional `<ShareDialog />` modal that allows owners to manage access, displays read-only collaborator directories to guests, and implements link copying with immediate checkout confirmation. Updated `WorkspaceNavbar`, `EditorWorkspaceClient`, and `/editor/[roomId]/page.tsx` routes. Project build checks compiled completely clean.
- Liveblocks Real-time Setup (10-liveblocks-setup.md) completed: Installed `@liveblocks/node` dependency; configured Presence and UserMeta global types in `liveblocks.config.ts`; implemented cached singleton Liveblocks server client and deterministic neon color mapping in `lib/liveblocks.ts`; created route handler `POST /api/liveblocks-auth` validating Clerk sessions, project DB access, and provisioning rooms before generating access tokens. Next.js static build checks and ESLint checks compiled clean.
- Implement base collaborative canvas (11-base-canvas.md) completed: Created shared canvas types in `types/canvas.ts`. Implemented `CanvasErrorFallback` for Liveblocks connection issues. Created client-side wrapper `CanvasWrapper` initializing the Liveblocks room with provider components, suspense loader fallback, and error boundaries. Designed and configured `CollaborativeCanvas` using `@xyflow/react` and `useLiveblocksFlow` starting with empty lists, loose connection mode, fitView enabled, dots background, custom dark-skinned MiniMap, and Cursors support. Integrated canvas into `EditorWorkspaceClient` main viewport grid. Verification builds compile successfully.
- Create shape panel (12-shape-panel.md) completed: Designed a custom `"canvas"` node renderer (`CanvasNode`) to support placeholder shape styling. Wrapped the collaborative canvas in `ReactFlowProvider` inside the `CanvasWrapper`. Implemented a floating pill-shaped toolbar for shapes at the bottom-center of the canvas. Added drag-and-drop mechanics to insert new nodes into the synced React Flow state backed by `@liveblocks/react-flow` with correct coordinates, default sizes, empty labels, and unique timestamp-counter IDs. Resolved layout height-collapsing issues by restoring `<main>`'s flexbox column styling and enforcing explicit viewport-percentage height constraints (`h-[calc(100vh-3.5rem)]`) on wrapper elements. Verification builds compile successfully.
- Node shape rendering (13-node-shape.md) completed: Extracted and designed a unified, reusable `ShapeRenderer` component rendering clean CSS styling for rectangle, pill, and circle, and scalable SVGs with non-scaling-strokes for diamond, hexagon, and cylinder. Integrated `ShapeRenderer` inside `CanvasNode` while keeping React Flow connection handles overlaid on top. Implemented a cursor-following ghost shape preview in `CollaborativeCanvas` using fixed layout coordinates updated via the workspace `onDragOver` listener, hidden the default browser drag image using a transparent 1x1 GIF in `onDragStart`, and cleaned up the dragging state on drop and drag end (supporting Esc/cancellations). Checked that production build compiled clean.
- Resizing and inline label editing for canvas nodes (14-node-editing.md) completed: Created shared `CanvasContext` to handle programmatic `onNodesChange` mutations without circular references. Implemented standard `<NodeResizer />` styled to match the dark technical palette. Implemented `updateNodeStyle` Liveblocks mutation to ensure nested `style` properties are reconciled in storage during dimension updates. Created an overlay editor utilizing an auto-resizing `<textarea>` with `nodrag nopan` styling to block canvas and node drag/pan interactions. Handled escape, blur, and enter actions to dismiss edit mode. Production build checks passed completely clean.
- Node Color Toolbar (15-node-color-toolbar.md) completed: Added 7 beautiful predefined color preset themes to types/canvas.ts. Updated ShapeRenderer to dynamically render background, border, text color, and matching SVG selected glow filters. Built floating color toolbar above selected canvas nodes that propagates state changes in real-time via collaborative node replace mutations. Prevented dragging/panning behaviors on toolbar hover and click events. Confirmed that Next.js production build succeeds cleanly.
- Edge Behavior (16-edge-behavior.md) completed: Configured all-side source/target Handles on CanvasNode with subtle styling and transition hover fade-in; implemented custom CanvasEdge using getSmoothStepPath with borderRadius: 0 for clean right-angle routing, layered with an invisible 15px interaction zone for hover/click ease, custom dynamically-colored arrowhead SVG markers, and inline double-click label editing containing an auto-growing input with event isolation to prevent canvas drag/pan. Verified production builds succeed clean.
- Canvas Ergonomics (17-canvas-ergonomics.md) completed: Created floating pill-shaped control bar at bottom-left, layered above the MiniMap. Configured React Flow zoom and fitView options with smooth animations and wired Undo/Redo commands using Liveblocks history. Developed global custom hook `hooks/useKeyboardShortcuts.ts` to register canvas key shortcuts (+, =, -, Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+Y) while ignoring text area/editable focus targets. Verified all builds compile successfully.
- Starter Templates (18-starter-templates.md) completed: Defined 3 default templates (Microservices Architecture, CI/CD Deployment Pipeline, and Event-Driven System) inside `components/editor/starter-templates.ts` using shared canvas types. Implemented `<StarterTemplatesModal />` featuring a custom `<TemplatePreview />` SVG renderer which calculates diagram bounds and draws shapes and edges dynamically inside a 3:2 card viewport without instantiating React Flow. Added a "Templates" nav action button in `WorkspaceNavbar` and wired modal state through `EditorWorkspaceClient` and `CanvasWrapper` to `CollaborativeCanvas`. Created a custom transaction mutation using `useMutation` to clear the active canvas and insert new template nodes and edges atomically, then animating `fitView` once rendered. Compilation builds succeed cleanly. Removed the MiniMap from the bottom-left of the canvas and positioned the zoom/history control bar at the bottom-left corner (`bottom-6 left-6`) to achieve a cleaner, less cluttered technical workspace UI.

