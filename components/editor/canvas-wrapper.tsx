"use client";

import * as React from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { ReactFlowProvider } from "@xyflow/react";
import { CollaborativeCanvas } from "./collaborative-canvas";
import { CanvasErrorFallback } from "./canvas-error-fallback";

interface CanvasWrapperProps {
  roomId: string;
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

export function CanvasWrapper({ roomId }: CanvasWrapperProps) {
  return (
    <ErrorBoundary
      FallbackComponent={CanvasErrorFallback}
      onReset={() => {
        // Attempt recovery by reloading the window context
        window.location.reload();
      }}
    >
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            isThinking: false,
          }}
        >
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <ReactFlowProvider>
              <CollaborativeCanvas />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </ErrorBoundary>
  );
}
