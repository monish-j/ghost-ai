"use client";

import * as React from "react";

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
    .replace(/[^\w\s-]/g, "") // remove all non-word, non-space, non-hyphen characters
    .replace(/[\s_-]+/g, "-") // replace multiple spaces or underscores/hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // trim hyphens from ends
}

export function useProjectDialogs() {
  const [activeDialog, setActiveDialog] = React.useState<"create" | "rename" | "delete" | null>(null);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const openCreate = () => {
    setName("");
    setSlug("");
    setActiveDialog("create");
    setSelectedProject(null);
  };

  const openRename = (project: Project) => {
    setSelectedProject(project);
    setName(project.name);
    setSlug(project.slug);
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
    setSlug("");
    setIsLoading(false);
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    if (activeDialog === "create") {
      setSlug(generateSlug(newName));
    }
  };

  return {
    activeDialog,
    selectedProject,
    name,
    setName,
    slug,
    setSlug,
    isLoading,
    setIsLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleNameChange,
  };
}
