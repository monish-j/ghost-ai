"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateSuffix(): string {
  return Math.random().toString(36).substring(2, 8);
}

export function useProjectActions() {
  const router = useRouter();
  const params = useParams();
  
  const [activeDialog, setActiveDialog] = React.useState<"create" | "rename" | "delete" | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [name, setName] = React.useState("");
  const [suffix, setSuffix] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const activeRoomId = params?.roomId as string;

  const openCreate = () => {
    setName("");
    setSuffix(generateSuffix());
    setActiveDialog("create");
    setSelectedProject(null);
  };

  const openRename = (project: Project) => {
    setSelectedProject(project);
    setName(project.name);
    setActiveDialog("rename");
  };

  const openDelete = (project: Project) => {
    setSelectedProject(project);
    setActiveDialog("delete");
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedProject(null);
    setName("");
    setSuffix("");
    setIsLoading(false);
  };

  // Compute the roomId preview: slugify(name)-suffix
  const computedRoomId = React.useMemo(() => {
    const baseSlug = generateSlug(name);
    if (!baseSlug) return "";
    return `${baseSlug}-${suffix}`;
  }, [name, suffix]);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: computedRoomId,
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      closeDialog();
      router.push(`/editor/${computedRoomId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      setIsLoading(false);
    }
  };

  const handleRename = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !selectedProject) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      closeDialog();
      router.refresh();
    } catch (error) {
      console.error("Error renaming project:", error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      const isCurrentWorkspace = selectedProject.id === activeRoomId;
      closeDialog();

      if (isCurrentWorkspace) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      setIsLoading(false);
    }
  };

  return {
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
  };
}
