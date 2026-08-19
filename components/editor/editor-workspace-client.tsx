"use client";

import * as React from "react";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { WorkspaceNavbar } from "@/components/editor/workspace-navbar";
import { useProjectActions, Project } from "@/lib/hooks/use-project-actions";
import { ShareDialog } from "@/components/editor/share-dialog";
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
import { Bot, Sparkles, Terminal, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorWorkspaceClientProps {
  currentProject: { id: string; name: string; isOwner: boolean };
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
    <div className="relative min-h-screen bg-black text-zinc-100 font-sans flex flex-col pt-14 overflow-hidden">
      {/* 1. Workspace Navbar */}
      <WorkspaceNavbar
        projectName={currentProject.name}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        aiSidebarOpen={aiSidebarOpen}
        onToggleAiSidebar={() => setAiSidebarOpen((prev) => !prev)}
        onOpenShare={() => setShareOpen(true)}
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
            "flex-1 relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden transition-all duration-300 ease-in-out",
            sidebarOpen ? "md:pl-80" : "pl-0",
            aiSidebarOpen ? "md:pr-96" : "pr-0"
          )}
        >
          {/* Ambient light glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

          {/* Central Canvas Placeholder content */}
          <div className="relative z-10 max-w-md flex flex-col gap-6 items-center">
            <div className="p-4 bg-zinc-900/80 rounded-full border border-zinc-800 text-purple-400 mb-2 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
              <Terminal className="size-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-200">
                Workspace Canvas
              </h1>
              <p className="text-sm text-zinc-500 max-w-sm">
                This is a placeholder for the interactive architecture editor. Real-time multi-player and canvas drawing tools are coming soon.
              </p>
            </div>
            
            <div className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs font-mono text-zinc-400">
              Project ID: {currentProject.id}
            </div>
          </div>

          {/* Bottom decorative details */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-500 font-mono">
            <span className="size-2 rounded-full bg-purple-500 animate-pulse" />
            WORKSPACE_ACTIVE
          </div>

          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-500 font-mono">
            Mode: Preview
          </div>
        </main>

        {/* 4. AI Chat Sidebar Placeholder */}
        <aside
          className={cn(
            "fixed top-14 right-0 w-96 h-[calc(100vh-3.5rem)] z-40 border-l border-zinc-800/80",
            "bg-zinc-950/95 backdrop-blur-md shadow-[-5px_0_25px_rgba(0,0,0,0.5)]",
            "flex flex-col justify-between transition-transform duration-300 ease-in-out select-none",
            aiSidebarOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* AI Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/10 rounded-md border border-purple-500/20 text-purple-400">
                <Bot className="size-4" />
              </div>
              <h2 className="text-sm font-semibold tracking-wide text-zinc-200">
                AI Copilot
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAiSidebarOpen(false)}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              title="Close AI chat"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* AI Content Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-3 bg-purple-500/5 rounded-full border border-purple-500/10 text-purple-400/50">
              <Bot className="size-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-300">
                AI Copilot coming soon
              </p>
              <p className="text-[11px] text-zinc-500 max-w-[200px]">
                Your AI-powered context-aware assistant for architecture design and code generation.
              </p>
            </div>
          </div>
          
          {/* AI Footer Chat Input Placeholder */}
          <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
            <div className="relative">
              <Input
                placeholder="Ask AI Copilot..."
                disabled
                className="bg-zinc-900/50 border-zinc-800 text-zinc-400 placeholder:text-zinc-600 pr-10 text-xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600">
                <Sparkles className="size-3.5" />
              </div>
            </div>
          </div>
        </aside>
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
  );
}
