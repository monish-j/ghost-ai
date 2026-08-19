"use client";

import * as React from "react";
import { NodeProps, Handle, Position, Node } from "@xyflow/react";
import { CanvasNodeData } from "@/types/canvas";
import { cn } from "@/lib/utils";

export function CanvasNode({ data, selected }: NodeProps<Node<CanvasNodeData>>) {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center rounded-md border text-xs font-medium transition-all duration-200 select-none",
        selected
          ? "bg-purple-950/20 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
          : "bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
      )}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {/* Target connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2 !h-2 !bg-zinc-600 hover:!bg-purple-500 !border-zinc-800 transition-colors"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-zinc-600 hover:!bg-purple-500 !border-zinc-800 transition-colors"
      />

      {/* Label Centered */}
      <div className="px-3 text-center break-words pointer-events-none w-full truncate">
        {data.label || <span className="text-zinc-600 italic">Empty</span>}
      </div>

      {/* Source connection handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2 !h-2 !bg-zinc-600 hover:!bg-purple-500 !border-zinc-800 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-zinc-600 hover:!bg-purple-500 !border-zinc-800 transition-colors"
      />
    </div>
  );
}
