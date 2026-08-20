"use client";

import * as React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import { CanvasContext } from "./canvas-context";
import { canvasEdge } from "@/types/canvas";
import { cn } from "@/lib/utils";

export function CanvasEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
  label = "",
}: EdgeProps) {
  const { getEdge } = useReactFlow();
  const context = React.useContext(CanvasContext);

  const [isHovered, setIsHovered] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempLabel, setTempLabel] = React.useState((label as string) || "");

  // Update local label state when prop changes
  React.useEffect(() => {
    setTempLabel((label as string) || "");
  }, [label]);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0, // Clean right-angle step routing
  });

  const saveLabel = React.useCallback(() => {
    setIsEditing(false);
    const edge = getEdge(id) as canvasEdge | undefined;
    if (edge && context?.onEdgesChange) {
      context.onEdgesChange([
        {
          id,
          type: "replace",
          item: {
            ...edge,
            label: tempLabel.trim(),
          },
        },
      ]);
    }
  }, [id, tempLabel, getEdge, context]);

  const cancelEdit = React.useCallback(() => {
    setIsEditing(false);
    setTempLabel((label as string) || "");
  }, [label]);

  const handleDoubleClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const isActive = selected || isHovered;

  return (
    <>
      {/* Custom svg marker definitions for dynamic arrow color changes */}
      <defs>
        <marker
          id={`arrow-inactive-${id}`}
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 7.5 5 L 0 8.5 z" fill="#52525b" />
        </marker>
        <marker
          id={`arrow-active-${id}`}
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 7.5 5 L 0 8.5 z" fill="#a855f7" />
        </marker>
      </defs>

      {/* Main visible connection line */}
      <BaseEdge
        path={edgePath}
        markerEnd={isActive ? `url(#arrow-active-${id})` : `url(#arrow-inactive-${id})`}
        style={{
          ...style,
          strokeWidth: 2,
          strokeDasharray: "none",
        }}
        className={cn(
          "transition-all duration-200 fill-none",
          isActive 
            ? "stroke-purple-500 [filter:drop-shadow(0_0_2px_rgba(168,85,247,0.3))]" 
            : "stroke-zinc-600/80"
        )}
      />

      {/* Thick invisible interaction path for easy clicking and hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={15}
        className="cursor-pointer pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
      />

      {/* Edge label container */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan z-30"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <div 
              className="relative min-w-[60px] max-w-[200px] flex items-center justify-center bg-zinc-950 border border-purple-500 rounded-md shadow-[0_4px_16px_rgba(168,85,247,0.15)] px-2.5 py-1"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="invisible px-1.5 text-[10px] font-bold whitespace-pre">
                {tempLabel || "Add label..."}
              </span>
              <input
                autoFocus
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                onBlur={saveLabel}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveLabel();
                  } else if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                className="absolute inset-0 w-full h-full text-center bg-transparent text-[10px] font-semibold outline-none border-none text-zinc-200 px-2.5 py-1 focus:ring-0 focus:outline-none"
                placeholder="Add label..."
              />
            </div>
          ) : (
            <>
              {label ? (
                <div 
                  className={cn(
                    "bg-zinc-950 border px-2.5 py-1 rounded-md text-[10px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-sm whitespace-nowrap select-none transition-all duration-200 cursor-pointer",
                    isActive 
                      ? "border-purple-500/80 text-purple-300" 
                      : "border-zinc-800/80 text-zinc-400"
                  )}
                  onDoubleClick={handleDoubleClick}
                >
                  {label}
                </div>
              ) : (
                isActive && (
                  <button
                    type="button"
                    onClick={handleDoubleClick}
                    className="bg-zinc-950 border border-zinc-800/60 text-zinc-500 hover:text-purple-300 hover:border-purple-500/40 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-200 cursor-pointer flex items-center gap-1"
                  >
                    <span>+ Label</span>
                  </button>
                )
              )}
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
