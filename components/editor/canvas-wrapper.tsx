"use client";

import * as React from "react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { ReactFlowProvider } from "@xyflow/react";
import { CollaborativeCanvas } from "./collaborative-canvas";

interface CanvasWrapperProps {
  roomId: string;
  templatesOpen: boolean;
  setTemplatesOpen: (open: boolean) => void;
  canvasJsonPath: string | null;
  onSaveStatusChange: (status: "idle" | "saving" | "saved" | "error") => void;
  registerManualSave: (saveFn: () => Promise<void>) => void;
}

function CanvasLoading() {
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] relative bg-zinc-950 flex flex-col items-center justify-center gap-4 select-none">
      <div className="relative flex items-center justify-center">
        <div className="size-12 rounded-full border-2 border-zinc-800 border-t-purple-500 animate-spin" />
        <div className="absolute size-8 rounded-full border border-purple-500/10 bg-purple-500/5 animate-pulse" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-semibold tracking-wide text-zinc-300">
          Loading Collaborative Canvas
        </p>
        <p className="text-xs text-zinc-500 font-medium">
          Establishing real-time synchronization...
        </p>
      </div>
    </div>
  );
}

export function CanvasWrapper({
  roomId,
  templatesOpen,
  setTemplatesOpen,
  canvasJsonPath,
  onSaveStatusChange,
  registerManualSave,
}: CanvasWrapperProps) {
  return (
    <ClientSideSuspense fallback={<CanvasLoading />}>
      <ReactFlowProvider>
        <CollaborativeCanvas
          projectId={roomId}
          canvasJsonPath={canvasJsonPath}
          templatesOpen={templatesOpen}
          setTemplatesOpen={setTemplatesOpen}
          onSaveStatusChange={onSaveStatusChange}
          registerManualSave={registerManualSave}
        />
      </ReactFlowProvider>
    </ClientSideSuspense>
  );
}
