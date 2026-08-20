"use client";

import * as React from "react";
import { NodeProps, Handle, Position, Node, NodeResizer, useReactFlow } from "@xyflow/react";
import { CanvasNodeData, COLOR_PRESETS, canvasNode } from "@/types/canvas";
import { ShapeRenderer } from "./shape-renderer";
import { CanvasContext } from "./canvas-context";
import { cn } from "@/lib/utils";

export function CanvasNode({ id, data, selected }: NodeProps<Node<CanvasNodeData>>) {
  const shape = data.shape || "rectangle";
  const { getNode } = useReactFlow();
  const context = React.useContext(CanvasContext);
  
  const [isEditing, setIsEditing] = React.useState(false);
  const [hoveredColorId, setHoveredColorId] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Sync label updates back to Liveblocks storage
  const handleLabelChange = React.useCallback(
    (newLabel: string) => {
      const node = getNode(id) as canvasNode | undefined;
      if (node && context?.onNodesChange) {
        context.onNodesChange([
          {
            type: "replace",
            id: node.id,
            item: {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            },
          },
        ]);
      }
    },
    [id, getNode, context]
  );

  // Sync color updates back to Liveblocks storage
  const handleColorChange = React.useCallback(
    (newColor: string) => {
      const node = getNode(id) as canvasNode | undefined;
      if (node && context?.onNodesChange) {
        context.onNodesChange([
          {
            type: "replace",
            id: node.id,
            item: {
              ...node,
              data: {
                ...node.data,
                color: newColor,
              },
            },
          },
        ]);
      }
    },
    [id, getNode, context]
  );

  // Focus and select all text on entering editing mode
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      // Auto-height adjustment on initial focus
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleLabelChange(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div 
      className="w-full h-full relative group"
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Subtle resize handles for selected nodes */}
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        lineClassName="!border-purple-500/50"
        handleClassName="!w-2 !h-2 !bg-zinc-950 !border !border-purple-500 hover:!bg-purple-500 hover:!scale-125 !rounded-sm !transition-all"
      />

      {/* Shape background and border renderer */}
      <ShapeRenderer
        shape={shape}
        selected={selected}
        label={data.label}
        showLabel={!isEditing}
        color={data.color}
      />

      {/* Floating color toolbar for selected nodes */}
      {selected && !isEditing && (
        <div 
          className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-50 nodrag nopan flex items-center gap-1.5 bg-zinc-950/95 border border-zinc-800/80 px-2.5 py-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md border-t-zinc-700/40 pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {COLOR_PRESETS.map((preset) => {
            const isActive = (data.color || "default") === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleColorChange(preset.id)}
                onMouseEnter={() => setHoveredColorId(preset.id)}
                onMouseLeave={() => setHoveredColorId(null)}
                style={{
                  boxShadow: hoveredColorId === preset.id 
                    ? `0 0 8px 1px ${preset.hexGlow}` 
                    : undefined,
                  borderColor: hoveredColorId === preset.id || isActive
                    ? preset.hexGlow 
                    : undefined,
                }}
                className={cn(
                  "relative group size-6 rounded-full flex items-center justify-center transition-all duration-200 border border-zinc-800/60 cursor-pointer hover:scale-105 active:scale-95",
                  preset.swatchBg,
                  isActive && "ring-2 ring-zinc-100 ring-offset-2 ring-offset-zinc-950 scale-105"
                )}
              >
                {/* Center dot showing the paired text color */}
                <span className={cn("size-2 rounded-full", preset.swatchDot)} />

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800/80 text-[9px] font-bold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] scale-95 origin-bottom">
                  {preset.name}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Inline text area overlay for editing labels */}
      {isEditing && (
        <div 
          className="absolute inset-0 flex items-center justify-center p-3 z-30 pointer-events-auto"
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <textarea
            ref={textareaRef}
            value={data.label}
            onChange={handleTextareaChange}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsEditing(false);
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setIsEditing(false);
              }
            }}
            className="nodrag nopan w-full bg-transparent text-center text-xs font-medium text-zinc-200 outline-none border-none resize-none focus:ring-0 focus:outline-none p-0 m-0"
            placeholder="Type a label..."
            rows={1}
          />
        </div>
      )}

      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />

      {/* Right handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />

      {/* Bottom handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!opacity-0 group-hover:!opacity-100 transition-opacity duration-200 !w-2 !h-2 !bg-white !border !border-zinc-950 !rounded-full z-20"
      />
    </div>
  );
}
