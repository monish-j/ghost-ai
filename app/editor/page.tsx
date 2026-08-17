"use client";

import * as React from "react";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { Terminal, Sliders, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

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
      />

      {/* 3. Editor Canvas */}
      <main className="flex-1 relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        {/* Glow ambient background behind the center unit */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-md p-8 rounded-xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md shadow-2xl flex flex-col gap-6 items-center">
          <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/30 text-purple-400">
            <Terminal className="size-8" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">
              Editor Canvas
            </h1>
            <p className="text-sm text-zinc-400 max-w-sm">
              The project sidebar floats dynamically above this workspace. Open and close the panel from the top navbar button.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex-1 gap-2 text-xs"
            >
              <Sliders className="size-4" />
              Toggle Sidebar
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white border-purple-700 gap-2 text-xs"
            >
              <Play className="size-4" />
              Run Preview
            </Button>
          </div>
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
    </div>
  );
}
