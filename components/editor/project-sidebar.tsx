"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, Plus, FolderOpen, Share2, Folder, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/hooks/use-project-actions";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  myProjects: Project[];
  sharedProjects: Project[];
  onOpenCreate: () => void;
  onOpenRename: (project: Project) => void;
  onOpenDelete: (project: Project) => void;
  activeProjectId?: string;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  myProjects,
  sharedProjects,
  onOpenCreate,
  onOpenRename,
  onOpenDelete,
  activeProjectId,
}: ProjectSidebarProps) {
  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-14 left-0 w-80 h-[calc(100vh-3.5rem)] z-40",
          "bg-zinc-950/95 backdrop-blur-md border-r border-zinc-800/80 shadow-[5px_0_25px_rgba(0,0,0,0.5)]",
          "flex flex-col justify-between transition-transform duration-300 ease-in-out select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Projects
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            title="Close projects list"
            aria-label="Close projects list"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
          <Tabs defaultValue="my-projects" className="w-full flex-1 flex flex-col gap-4">
            <TabsList className="grid grid-cols-2 bg-zinc-900/50 border border-zinc-800 p-0.5 w-full">
              <TabsTrigger value="my-projects" className="text-xs">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="text-xs">
                Shared
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: My Projects */}
            <TabsContent value="my-projects" className="flex-1 flex flex-col focus-visible:outline-none">
              {myProjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg p-6 text-center py-16 gap-3">
                  <div className="p-3 bg-zinc-900/50 rounded-full border border-zinc-800/60 text-purple-400">
                    <FolderOpen className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-300">
                      No projects found
                    </p>
                    <p className="text-[11px] text-zinc-500 max-w-[180px] mx-auto">
                      Create a new project from the button below to get started.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {myProjects.map((project) => (
                    <div
                      key={project.id}
                      className={cn(
                        "group flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200",
                        project.id === activeProjectId
                          ? "border-purple-500/50 bg-purple-500/10"
                          : "border-zinc-800/20 bg-zinc-900/10 hover:border-zinc-800/60 hover:bg-zinc-900/40"
                      )}
                    >
                      <Link
                        href={`/editor/${project.id}`}
                        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
                      >
                        <div className={cn(
                          "p-2 rounded-md transition-colors",
                          project.id === activeProjectId
                            ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                            : "bg-purple-500/5 border border-purple-500/10 text-purple-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/20"
                        )}>
                          <Folder className="size-4.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-xs font-medium truncate transition-colors",
                            project.id === activeProjectId ? "text-purple-300" : "text-zinc-200 group-hover:text-zinc-100"
                          )}>
                            {project.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono truncate">
                            /{project.slug}
                          </span>
                        </div>
                      </Link>

                      {/* Project actions (only if owned) */}
                      {project.isOwner && (
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              onOpenRename(project);
                            }}
                            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                            title={`Rename ${project.name}`}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              onOpenDelete(project);
                            }}
                            className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                            title={`Delete ${project.name}`}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Shared Projects */}
            <TabsContent value="shared" className="flex-1 flex flex-col focus-visible:outline-none">
              {sharedProjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg p-6 text-center py-16 gap-3">
                  <div className="p-3 bg-zinc-900/50 rounded-full border border-zinc-800/60 text-purple-400">
                    <Share2 className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-300">
                      No shared projects
                    </p>
                    <p className="text-[11px] text-zinc-500 max-w-[180px] mx-auto">
                      Projects shared by collaborators will appear in this space.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {sharedProjects.map((project) => (
                    <div
                      key={project.id}
                      className={cn(
                        "group flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200",
                        project.id === activeProjectId
                          ? "border-purple-500/50 bg-purple-500/10"
                          : "border-zinc-800/20 bg-zinc-900/10 hover:border-zinc-800/60 hover:bg-zinc-900/40"
                      )}
                    >
                      <Link
                        href={`/editor/${project.id}`}
                        className="flex-1 flex items-center gap-3 min-w-0 cursor-pointer"
                      >
                        <div className={cn(
                          "p-2 rounded-md transition-colors",
                          project.id === activeProjectId
                            ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                            : "bg-purple-500/5 border border-purple-500/10 text-purple-400 group-hover:bg-purple-500/10 group-hover:border-purple-500/20"
                        )}>
                          <Folder className="size-4.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-xs font-medium truncate transition-colors",
                            project.id === activeProjectId ? "text-purple-300" : "text-zinc-200 group-hover:text-zinc-100"
                          )}>
                            {project.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono truncate">
                            /{project.slug}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
          <Button
            variant="default"
            onClick={onOpenCreate}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white border border-purple-700 gap-2 text-xs"
          >
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </aside>

      {/* Backdrop scrim (tapping outside closes it; visible background on mobile, softer overlay on md screens) */}
      {isOpen && (
        <div
          className="fixed inset-0 top-14 z-30 bg-black/60 md:bg-black/20 backdrop-blur-xs md:backdrop-blur-none transition-opacity duration-300"
          onClick={onClose}
        />
      )}
    </>
  );
}
