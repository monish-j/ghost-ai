"use client";

import * as React from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useProjectDialogs, Project } from "@/lib/hooks/use-project-dialogs";

const INITIAL_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Ecommerce API Schema",
    slug: "ecommerce-api-schema",
    isOwner: true,
  },
  {
    id: "2",
    name: "Auth Microservice",
    slug: "auth-microservice",
    isOwner: true,
  },
  {
    id: "3",
    name: "Shared Data Pipeline",
    slug: "shared-data-pipeline",
    isOwner: false,
  },
  {
    id: "4",
    name: "Collaborative Design",
    slug: "collaborative-design",
    isOwner: false,
  },
];

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);

  const {
    activeDialog,
    selectedProject,
    name,
    setName,
    slug,
    isLoading,
    setIsLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleNameChange,
  } = useProjectDialogs();

  const handleCreateProject = (name: string, slug: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      slug,
      isOwner: true,
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 font-sans flex flex-col pt-14 overflow-hidden">
      {/* 1. Editor Navbar */}
      <EditorNavbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* 2. Floating Project Sidebar */}
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        myProjects={projects.filter((p) => p.isOwner)}
        sharedProjects={projects.filter((p) => !p.isOwner)}
        onOpenCreate={openCreate}
        onOpenRename={openRename}
        onOpenDelete={openDelete}
      />

      {/* 3. Editor Canvas */}
      <main className="flex-1 relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        {/* Glow ambient background behind the center unit */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-md flex flex-col gap-6 items-center">
          <div className="p-4 bg-purple-500/10 rounded-full border border-purple-500/20 text-purple-400 mb-2 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <FolderOpen className="size-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              Create a project or open an existing one
            </h1>
            <p className="text-sm text-zinc-400 max-w-sm">
              Start a new architecture workspace, or choose a project from the sidebar.
            </p>
          </div>

          <Button
            onClick={openCreate}
            className="mt-2 bg-purple-600 hover:bg-purple-500 text-white border-purple-700 gap-2 text-sm px-6 py-5 rounded-lg shadow-lg shadow-purple-600/10 cursor-pointer"
          >
            <Plus className="size-4.5" />
            New Project
          </Button>
        </div>

        {/* Dynamic decorative corners or info bars to show canvas details */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-500 font-mono">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM_ONLINE | Grid 24px
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 text-[11px] text-zinc-500 font-mono">
          Viewport: 100%
        </div>
      </main>

      {/* Create Project Dialog */}
      <Dialog open={activeDialog === "create"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Start a new architecture workspace.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              setIsLoading(true);
              setTimeout(() => {
                handleCreateProject(name, slug);
                closeDialog();
              }, 600);
            }}
          >
            <div className="space-y-4 py-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="project-name" className="text-xs font-medium text-zinc-400">
                  Project Name
                </label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="My Awesome Architecture"
                  required
                  disabled={isLoading}
                  autoFocus
                  className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="text-xs font-medium text-zinc-400">
                  Slug Preview
                </div>
                <div className="px-3 py-2.5 rounded-md border border-zinc-800 bg-zinc-900/40 text-xs font-mono text-zinc-400 break-all select-all min-h-[38px] flex items-center">
                  {slug || "my-awesome-architecture"}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !selectedProject) return;
              setIsLoading(true);
              setTimeout(() => {
                handleRenameProject(selectedProject.id, name);
                closeDialog();
              }, 600);
            }}
          >
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
              onClick={() => {
                if (!selectedProject) return;
                setIsLoading(true);
                setTimeout(() => {
                  handleDeleteProject(selectedProject.id);
                  closeDialog();
                }, 600);
              }}
              disabled={isLoading}
              className="cursor-pointer"
            >
              {isLoading ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
