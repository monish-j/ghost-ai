"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftOpen, PanelLeftClose, Sparkles } from "lucide-react";

interface EditorNavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function EditorNavbar({ sidebarOpen, onToggleSidebar }: EditorNavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 select-none">
      {/* Left Section: Sidebar Toggle Button */}
      <div className="flex items-center gap-3 w-1/3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4.5" />
          ) : (
            <PanelLeftOpen className="size-4.5" />
          )}
        </Button>
      </div>

      {/* Center Section: App Title / Logo */}
      <div className="flex items-center justify-center gap-2 w-1/3">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-purple-500/20 bg-purple-500/5">
          <Sparkles className="size-3.5 text-purple-400 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide text-zinc-200">
            ghost <span className="text-purple-400 font-extrabold">AI</span>
          </span>
        </div>
      </div>

      {/* Right Section: Empty placeholder for future actions */}
      <div className="w-1/3 flex justify-end" />
    </header>
  );
}
