"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Sparkles, Share2, Bot } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface WorkspaceNavbarProps {
  projectName: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  aiSidebarOpen: boolean;
  onToggleAiSidebar: () => void;
  onOpenShare: () => void;
}

export function WorkspaceNavbar({
  projectName,
  sidebarOpen,
  onToggleSidebar,
  aiSidebarOpen,
  onToggleAiSidebar,
  onOpenShare,
}: WorkspaceNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 select-none">
      {/* Left Section: Sidebar Toggle and Project Logo & Name */}
      <div className="flex items-center gap-3 w-1/3 min-w-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors shrink-0"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4.5" />
          ) : (
            <PanelLeftOpen className="size-4.5" />
          )}
        </Button>
        <Link href="/editor" className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-colors shrink-0">
          <Sparkles className="size-3.5 text-purple-400" />
          <span className="text-xs font-semibold tracking-wide text-zinc-200">
            ghost <span className="text-purple-400 font-extrabold text-[11px]">AI</span>
          </span>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 shrink-0">
          <span className="text-zinc-700">/</span>
          <span className="text-xs font-medium text-zinc-300 truncate max-w-[150px]" title={projectName}>
            {projectName}
          </span>
        </div>
      </div>

      {/* Center Section: App Title / logo when mobile or project name */}
      <div className="flex sm:hidden items-center justify-center gap-2 w-1/3 min-w-0">
        <span className="text-xs font-medium text-zinc-300 truncate max-w-[120px]" title={projectName}>
          {projectName}
        </span>
      </div>
      <div className="hidden sm:block w-1/3" />

      {/* Right Section: Actions + User Profile */}
      <div className="w-1/3 flex justify-end items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenShare}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors gap-1.5 px-2.5 h-8 text-xs cursor-pointer"
          title="Share project"
        >
          <Share2 className="size-3.5" />
          <span className="hidden md:inline">Share</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleAiSidebar}
          className={`text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors relative h-8 w-8 cursor-pointer ${
            aiSidebarOpen ? "bg-purple-500/10 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20" : ""
          }`}
          title={aiSidebarOpen ? "Close AI chat" : "Open AI chat"}
          aria-label={aiSidebarOpen ? "Close AI chat" : "Open AI chat"}
        >
          <Bot className="size-4.5" />
        </Button>

        <div className="border-l border-zinc-800 h-4 mx-1" />

        <UserButton />
      </div>
    </header>
  );
}
