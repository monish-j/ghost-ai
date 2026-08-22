"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  BackgroundVariant,
  useReactFlow,
  NodeChange,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { useMutation, useUndo, useRedo, useCanUndo, useCanRedo, useUpdateMyPresence, useOther } from "@liveblocks/react";
import { ParticipantAvatars } from "./participant-avatars";
import {
  Square,
  Diamond,
  Circle,
  Pill,
  Cylinder,
  Hexagon,
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
} from "lucide-react";
import { CanvasNode } from "./canvas-node";
import { CanvasEdge } from "./canvas-edge";
import { canvasNode, canvasEdge } from "@/types/canvas";
import { ShapeRenderer } from "./shape-renderer";
import { CanvasContext } from "./canvas-context";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAutosave, SaveStatus } from "@/hooks/useAutosave";

import { LiveObject } from "@liveblocks/client";
import { StarterTemplatesModal } from "./starter-templates-modal";
import { CanvasTemplate } from "./starter-templates";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes = {
  canvas: CanvasNode,
};

const edgeTypes = {
  canvasEdge: CanvasEdge,
};

const SHAPES = [
  { type: "rectangle", label: "Rectangle", icon: Square, width: 120, height: 60 },
  { type: "diamond", label: "Diamond", icon: Diamond, width: 100, height: 100 },
  { type: "circle", label: "Circle", icon: Circle, width: 80, height: 80 },
  { type: "pill", label: "Pill", icon: Pill, width: 120, height: 50 },
  { type: "cylinder", label: "Cylinder", icon: Cylinder, width: 90, height: 110 },
  { type: "hexagon", label: "Hexagon", icon: Hexagon, width: 100, height: 90 },
];

function CustomCursor({ userId, connectionId }: { userId: string; connectionId: number }) {
  const info = useOther(connectionId, (other) => other.info);
  const thinking = useOther(
    connectionId,
    (other) => other.presence?.thinking || other.presence?.isThinking
  );

  if (!info) return null;

  const color = info.color || "#a855f7";
  const name = info.name || "Collaborator";

  return (
    <div className="relative pointer-events-none select-none">
      {/* Custom Cursor SVG */}
      <svg
        className="absolute top-0 left-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.5 1.5V14.5L5 11L8.5 16L10.5 14.5L7 9.5L11.5 9.5L1.5 1.5Z"
          fill={color}
          stroke="#09090b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>

      {/* Name Badge */}
      <div
        className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-md border whitespace-nowrap"
        style={{
          backgroundColor: color,
          borderColor: `${color}cc`,
          boxShadow: `0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px ${color}33`,
        }}
      >
        {thinking && (
          <span className="size-2 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin shrink-0" />
        )}
        <span>{name}</span>
      </div>
    </div>
  );
}

interface CollaborativeCanvasProps {
  projectId: string;
  canvasJsonPath: string | null;
  templatesOpen: boolean;
  setTemplatesOpen: (open: boolean) => void;
  onSaveStatusChange: (status: SaveStatus) => void;
  registerManualSave: (saveFn: () => Promise<void>) => void;
}

export function CollaborativeCanvas({
  projectId,
  canvasJsonPath,
  templatesOpen,
  setTemplatesOpen,
  onSaveStatusChange,
  registerManualSave,
}: CollaborativeCanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<canvasNode, canvasEdge>({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });

  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isLoadingDb, setIsLoadingDb] = React.useState(false);

  // Mutation to update the nested style.width and style.height in Liveblocks storage
  const updateNodeStyle = useMutation(
    ({ storage }, nodeId: string, width: number, height: number) => {
      const flow = (storage as any).get("flow") as any;
      if (!flow) return;
      const nodesMap = flow.get("nodes");
      const node = nodesMap?.get(nodeId);
      if (node) {
        const style = node.get("style");
        if (style) {
          style.set("width", width);
          style.set("height", height);
        }
      }
    },
    []
  );

  // Custom onNodesChange handler that intercepts dimensions changes to sync node styles
  const handleNodesChange = React.useCallback(
    (changes: NodeChange<canvasNode>[]) => {
      onNodesChange(changes);
      for (const change of changes) {
        if (change.type === "dimensions" && change.dimensions) {
          updateNodeStyle(change.id, change.dimensions.width, change.dimensions.height);
        }
      }
    },
    [onNodesChange, updateNodeStyle]
  );

  const reactFlowInstance = useReactFlow();
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = reactFlowInstance;

  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({
    reactFlowInstance,
    undo,
    redo,
  });

  const updateMyPresence = useUpdateMyPresence();

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent) => {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      updateMyPresence({ cursor: position });
    },
    [screenToFlowPosition, updateMyPresence]
  );

  const handleMouseLeave = React.useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  const idCounter = React.useRef(0);

  // Mutation to clear the canvas and replace with template nodes/edges in a single transaction
  const importTemplate = useMutation(
    ({ storage }, template: CanvasTemplate) => {
      const flow = (storage as any).get("flow") as any;
      if (!flow) return;

      const nodesMap = flow.get("nodes");
      const edgesMap = flow.get("edges");

      if (nodesMap) {
        Array.from(nodesMap.keys()).forEach((key) => nodesMap.delete(key));
        template.nodes.forEach((node) => {
          nodesMap.set(
            node.id,
            new LiveObject({
              id: node.id,
              type: node.type,
              position: node.position,
              width: node.width,
              height: node.height,
              style: new LiveObject((node.style || {}) as any),
              data: new LiveObject(node.data as any),
              selected: false,
              dragging: false,
              measured: false,
              resizing: false,
            })
          );
        });
      }

      if (edgesMap) {
        Array.from(edgesMap.keys()).forEach((key) => edgesMap.delete(key));
        template.edges.forEach((edge) => {
          edgesMap.set(
            edge.id,
            new LiveObject({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: edge.type,
              selected: false,
            })
          );
        });
      }
    },
    []
  );

  // Mutation to clear the canvas and restore saved canvas state in a single transaction
  const setCanvasState = useMutation(
    ({ storage }, loadedNodes: any[], loadedEdges: any[]) => {
      const flow = (storage as any).get("flow") as any;
      if (!flow) return;

      const nodesMap = flow.get("nodes");
      const edgesMap = flow.get("edges");

      if (nodesMap) {
        Array.from(nodesMap.keys()).forEach((key) => nodesMap.delete(key));
        loadedNodes.forEach((node) => {
          nodesMap.set(
            node.id,
            new LiveObject({
              id: node.id,
              type: node.type || "canvas",
              position: node.position,
              width: node.width,
              height: node.height,
              style: new LiveObject((node.style || {}) as any),
              data: new LiveObject(node.data as any),
              selected: false,
              dragging: false,
              measured: false,
              resizing: false,
            })
          );
        });
      }

      if (edgesMap) {
        Array.from(edgesMap.keys()).forEach((key) => edgesMap.delete(key));
        loadedEdges.forEach((edge) => {
          edgesMap.set(
            edge.id,
            new LiveObject({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              type: edge.type || "canvasEdge",
              selected: false,
              label: (edge as any).label || "",
              style: new LiveObject(((edge as any).style || {}) as any),
            })
          );
        });
      }
    },
    []
  );

  const hasLoadedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasLoadedRef.current) return;

    const initializeCanvas = async () => {
      // Check if the Liveblocks room already has nodes or edges
      if (nodes.length > 0 || edges.length > 0) {
        setIsInitialized(true);
        hasLoadedRef.current = true;
        return;
      }

      // Room is empty, check if database has a saved blob path
      if (canvasJsonPath) {
        setIsLoadingDb(true);
        try {
          const res = await fetch(`/api/projects/${projectId}/canvas`);
          if (res.ok) {
            const data = await res.json();
            if (data.nodes && data.edges) {
              setCanvasState(data.nodes, data.edges);
              // Wait briefly for mutation to apply to avoid race conditions with autosave hook
              setTimeout(() => {
                setIsInitialized(true);
                setIsLoadingDb(false);
              }, 100);
              hasLoadedRef.current = true;
              return;
            }
          }
        } catch (error) {
          console.error("Failed to load saved canvas state:", error);
        }
      }

      // Fallback: no saved state or empty DB, immediately initialized
      setIsInitialized(true);
      setIsLoadingDb(false);
      hasLoadedRef.current = true;
    };

    initializeCanvas();
  }, [canvasJsonPath, projectId, nodes, edges, setCanvasState]);

  const { saveStatus, saveCanvas } = useAutosave({
    projectId,
    nodes,
    edges,
    isInitialized,
  });

  // Sync save status back to parent
  React.useEffect(() => {
    onSaveStatusChange(saveStatus);
  }, [saveStatus, onSaveStatusChange]);

  // Sync manual save trigger to parent
  React.useEffect(() => {
    registerManualSave(saveCanvas);
  }, [saveCanvas, registerManualSave]);

  const handleImportTemplate = React.useCallback(
    (template: CanvasTemplate) => {
      importTemplate(template);
      setTemplatesOpen(false);
      // Wait for layout updates, then fit view
      setTimeout(() => {
        fitView({ duration: 300 });
      }, 100);
    },
    [importTemplate, setTemplatesOpen, fitView]
  );

  // Track shape drag state for ghost preview
  const [draggedShape, setDraggedShape] = React.useState<{
    type: string;
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    // Continuously update client coordinates of the cursor during drag
    setDraggedShape((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        x: event.clientX,
        y: event.clientY,
      };
    });
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDraggedShape(null); // Clear preview state on drop

      const rawData = event.dataTransfer.getData("application/reactflow");
      if (!rawData) return;

      try {
        const payload = JSON.parse(rawData);
        const { shape, width, height } = payload;

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Generate unique node ID using shape name, timestamp, and local counter
        const id = `${shape}-${Date.now()}-${idCounter.current++}`;

        const newNode: canvasNode = {
          id,
          type: "canvas", // Custom node type registered in nodeTypes
          position,
          data: {
            label: "", // Empty label by default
            shape, // Shape value (rectangle, circle, etc.)
          },
          width,
          height,
          style: {
            width,
            height,
          },
        };

        // Add node to collaborative flow. Cast onNodesChange to any to bypass
        // the React Flow NodeChange union definition since `@liveblocks/react-flow`
        // explicitly supports "add" changes in its mutation at runtime.
        (onNodesChange as any)([{ type: "add", item: newNode }]);
      } catch (error) {
        console.error("Failed to add shape node:", error);
      }
    },
    [screenToFlowPosition, onNodesChange]
  );

  if (isLoadingDb) {
    return (
      <div className="w-full h-[calc(100vh-3.5rem)] relative bg-zinc-950 flex flex-col items-center justify-center gap-4 select-none">
        <div className="relative flex items-center justify-center">
          <div className="size-12 rounded-full border-2 border-zinc-800 border-t-purple-500 animate-spin" />
          <div className="absolute size-8 rounded-full border border-purple-500/10 bg-purple-500/5 animate-pulse" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold tracking-wide text-zinc-300">
            Restoring Saved Canvas
          </p>
          <p className="text-xs text-zinc-500 font-medium">
            Fetching latest snapshot from database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <CanvasContext.Provider value={{ onNodesChange: handleNodesChange, onEdgesChange }}>
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="w-full h-[calc(100vh-3.5rem)] relative bg-zinc-950"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          deleteKeyCode={["Backspace", "Delete"]}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: "canvasEdge",
          }}
          fitView
          connectionMode={ConnectionMode.Loose}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#27272a"
            gap={24}
            size={1.5}
          />
          <Cursors components={{ Cursor: CustomCursor }} />
        </ReactFlow>

        {/* Top-Right Participant Avatars */}
        <div className="absolute top-4 right-4 z-50">
          <ParticipantAvatars />
        </div>

      {/* Floating control bar for zoom and undo/redo */}
      <div className="absolute bottom-6 left-6 z-50 bg-zinc-950/85 border border-zinc-800/80 p-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center gap-1 backdrop-blur-md border-t-zinc-700/40 select-none nodrag nopan">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => zoomOut({ duration: 200 })}
            className="group relative p-2 bg-zinc-900/60 hover:bg-purple-600/20 border border-zinc-800/80 hover:border-purple-500/50 rounded-full text-zinc-400 hover:text-purple-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Zoom Out"
          >
            <ZoomOut className="size-4" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800/80 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Zoom Out (-)
            </div>
          </button>

          <button
            onClick={() => fitView({ duration: 200 })}
            className="group relative p-2 bg-zinc-900/60 hover:bg-purple-600/20 border border-zinc-800/80 hover:border-purple-500/50 rounded-full text-zinc-400 hover:text-purple-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Fit View"
          >
            <Maximize className="size-4" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800/80 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Fit View
            </div>
          </button>

          <button
            onClick={() => zoomIn({ duration: 200 })}
            className="group relative p-2 bg-zinc-900/60 hover:bg-purple-600/20 border border-zinc-800/80 hover:border-purple-500/50 rounded-full text-zinc-400 hover:text-purple-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Zoom In"
          >
            <ZoomIn className="size-4" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800/80 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Zoom In (+)
            </div>
          </button>
        </div>

        {/* Thin Divider */}
        <div className="w-px h-5 bg-zinc-800 mx-1" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => undo()}
            disabled={!canUndo}
            className="group relative p-2 bg-zinc-900/60 hover:bg-purple-600/20 border border-zinc-800 hover:border-purple-500/50 rounded-full text-zinc-400 hover:text-purple-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-zinc-900/60 disabled:hover:border-zinc-800/80 disabled:hover:text-zinc-400"
            aria-label="Undo"
          >
            <Undo2 className="size-4" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800/80 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Undo (Ctrl+Z)
            </div>
          </button>

          <button
            onClick={() => redo()}
            disabled={!canRedo}
            className="group relative p-2 bg-zinc-900/60 hover:bg-purple-600/20 border border-zinc-800/80 hover:border-purple-500/50 rounded-full text-zinc-400 hover:text-purple-300 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-zinc-900/60 disabled:hover:border-zinc-800/80 disabled:hover:text-zinc-400"
            aria-label="Redo"
          >
            <Redo2 className="size-4" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800/80 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Redo (Ctrl+Y / Shift+Z)
            </div>
          </button>
        </div>
      </div>

      {/* Floating pill-shaped toolbar for drawing shapes */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-950/85 border border-zinc-800/80 px-4 py-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex items-center gap-3 backdrop-blur-md border-t-zinc-700/40">
        <div className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase px-2 select-none border-r border-zinc-800/80 mr-1">
          Shapes
        </div>
        {SHAPES.map((shape) => {
          const Icon = shape.icon;
          return (
            <div
              key={shape.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/reactflow",
                  JSON.stringify({
                    shape: shape.type,
                    width: shape.width,
                    height: shape.height,
                  })
                );
                e.dataTransfer.effectAllowed = "move";

                // Create transparent drag image to hide the browser's default drag preview
                const img = new Image();
                img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                e.dataTransfer.setDragImage(img, 0, 0);

                // Set initial preview state at current mouse cursor
                setDraggedShape({
                  type: shape.type,
                  width: shape.width,
                  height: shape.height,
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
              onDragEnd={() => {
                // Ensure drag preview is hidden if drag is cancelled
                setDraggedShape(null);
              }}
              className="group relative p-2 bg-zinc-900/60 hover:bg-purple-600/20 border border-zinc-800 hover:border-purple-500/50 rounded-lg text-zinc-400 hover:text-purple-300 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95"
            >
              <Icon className="size-5" />
              {/* Custom tooltip hover effect */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-zinc-900 border border-zinc-800/80 text-[10px] font-semibold text-zinc-200 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {shape.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ghost Drag Preview attached to cursor */}
      {draggedShape && (
        <div
          style={{
            position: "fixed",
            left: draggedShape.x,
            top: draggedShape.y,
            width: draggedShape.width,
            height: draggedShape.height,
            pointerEvents: "none",
            zIndex: 9999,
          }}
          className="opacity-50 pointer-events-none"
        >
          <ShapeRenderer
            shape={draggedShape.type}
            selected={true} // Render highlighted (purple outline/glow) for drag preview
            showLabel={false} // Label is not needed in the drag preview
          />
        </div>
      )}

      {/* Starter Templates Modal */}
      <StarterTemplatesModal
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onImport={handleImportTemplate}
      />
    </div>
    </CanvasContext.Provider>
  );
}
