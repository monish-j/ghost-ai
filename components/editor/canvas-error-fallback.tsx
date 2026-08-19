"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasErrorFallbackProps {
  error: any;
  resetErrorBoundary: () => void;
}

export function CanvasErrorFallback({ error, resetErrorBoundary }: CanvasErrorFallbackProps) {
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] relative bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full p-6 rounded-lg border border-red-500/20 bg-zinc-900/40 backdrop-blur-md shadow-[0_0_50px_rgba(239,68,68,0.05)] space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-400">
            <AlertCircle className="size-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-200">
            Connection Lost
          </h2>
          <p className="text-xs text-zinc-500 max-w-sm">
            We couldn't connect to the real-time collaboration server. This might be due to authentication expiry or connection issues.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded border border-zinc-800 bg-zinc-950/80 font-mono text-[11px] text-zinc-400 break-all text-left max-h-32 overflow-y-auto">
            Error: {error.message}
          </div>
        )}

        <Button
          onClick={resetErrorBoundary}
          className="w-full bg-red-950/40 hover:bg-red-900/40 text-red-200 border border-red-800/50 hover:border-red-700/60 cursor-pointer"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
