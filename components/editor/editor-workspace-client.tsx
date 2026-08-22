"use client";

import * as React from "react";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { useProjectActions, Project } from "@/lib/hooks/use-project-actions";
import { ShareDialog } from "@/components/editor/share-dialog";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasWrapper } from "@/components/editor/canvas-wrapper";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { ErrorBoundary } from "react-error-boundary";
import { CanvasErrorFallback } from "./canvas-error-fallback";

interface EditorWorkspaceClientProps {
  currentProject: { id: string; name: string; isOwner: boolean; canvasJsonPath: string | null };
  initialMyProjects: Project[];
  initialSharedProjects: Project[];
}

export function EditorWorkspaceClient({
  currentProject,
  initialMyProjects,
  initialSharedProjects,
}: EditorWorkspaceClientProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [aiSidebarOpen, setAiSidebarOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [templatesOpen, setTemplatesOpen] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved" | "error">("saved");
  const manualSaveRef = React.useRef<(() => Promise<void>) | null>(null);

  const handleManualSave = React.useCallback(async () => {
    if (manualSaveRef.current) {
      await manualSaveRef.current();
    }
  }, []);

  const {
    activeDialog,
    selectedProject,
    name,
    setName,
    computedRoomId,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectActions();

  return (
    <ErrorBoundary
      FallbackComponent={CanvasErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={currentProject.id}
          initialPresence={{
            cursor: null,
            thinking: false,
            isThinking: false,
          }}
        >
          <div className="relative min-h-screen bg-black text-zinc-100 font-sans flex flex-col pt-14 overflow-hidden">
      {/* 1. Workspace Navbar */}
      <WorkspaceNavbar
        projectName={currentProject.name}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        aiSidebarOpen={aiSidebarOpen}
        onToggleAiSidebar={() => setAiSidebarOpen((prev) => !prev)}
        onOpenShare={() => setShareOpen(true)}
        onOpenTemplates={() => setTemplatesOpen(true)}
        saveStatus={saveStatus}
        onManualSave={handleManualSave}
      />

      {/* 2. Floating Project Sidebar */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        myProjects={initialMyProjects}
        sharedProjects={initialSharedProjects}
        onOpenCreate={openCreate}
        onOpenRename={openRename}
        onOpenDelete={openDelete}
        activeProjectId={currentProject.id}
      />

      {/* Layout Content wrapper */}
      <div className="flex-1 flex relative overflow-hidden h-[calc(100vh-3.5rem)]">
        <main
          className={cn(
            "flex-1 flex flex-col relative bg-zinc-950 overflow-hidden transition-all duration-300 ease-in-out h-full",
            sidebarOpen ? "md:pl-80" : "pl-0",
            aiSidebarOpen ? "md:pr-96" : "pr-0"
          )}
        >
          <CanvasWrapper
            roomId={currentProject.id}
            templatesOpen={templatesOpen}
            setTemplatesOpen={setTemplatesOpen}
            canvasJsonPath={currentProject.canvasJsonPath}
            onSaveStatusChange={setSaveStatus}
            registerManualSave={(fn) => {
              manualSaveRef.current = fn;
            }}
          />
        </main>

        {/* 4. AI Chat Sidebar */}
        <AiSidebar isOpen={aiSidebarOpen} onClose={() => setAiSidebarOpen(false)} />
      </div>

      {/* Create Project Dialog */}
      <Dialog open={activeDialog === "create"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Start a new architecture workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="project-name" className="text-xs font-medium text-zinc-400">
                  Project Name
                </label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Architecture"
                  required
                  disabled={isLoading}
                  autoFocus
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="text-xs font-medium text-zinc-400">
                  Room ID Preview
                </div>
                <div className="px-3 py-2.5 rounded-md border border-zinc-800 bg-zinc-900/40 text-xs font-mono text-zinc-400 break-all select-all min-h-[38px] flex items-center">
                  {computedRoomId || "my-awesome-architecture"}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                disabled={isLoading}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white border-purple-700 cursor-pointer"
              >
                {isLoading ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={activeDialog === "rename"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Rename project <span className="font-semibold text-zinc-200">&ldquo;{selectedProject?.name}&rdquo;</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename}>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="rename-project-name" className="text-xs font-medium text-zinc-400">
                  Project Name
                </label>
                <Input
                  id="rename-project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={closeDialog}
                disabled={isLoading}
                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !name.trim() || name.trim() === selectedProject?.name}
                className="bg-purple-600 hover:bg-purple-500 text-white border-purple-700 cursor-pointer"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={activeDialog === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold text-zinc-200">&ldquo;{selectedProject?.name}&rdquo;</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDialog}
              disabled={isLoading}
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Project Dialog */}
      <ShareDialog
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        projectId={currentProject.id}
        projectName={currentProject.name}
        isOwner={currentProject.isOwner}
      />
          </div>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
  );
}
