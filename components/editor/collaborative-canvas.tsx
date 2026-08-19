"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  ConnectionMode,
  BackgroundVariant,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow";
import { Square, Diamond, Circle, Pill, Cylinder, Hexagon } from "lucide-react";
import { CanvasNode } from "./canvas-node";
import { canvasNode, canvasEdge } from "@/types/canvas";

import "@xyflow/react/dist/style.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes = {
  canvas: CanvasNode,
};

const SHAPES = [
  { type: "rectangle", label: "Rectangle", icon: Square, width: 120, height: 60 },
  { type: "diamond", label: "Diamond", icon: Diamond, width: 100, height: 100 },
  { type: "circle", label: "Circle", icon: Circle, width: 80, height: 80 },
  { type: "pill", label: "Pill", icon: Pill, width: 120, height: 50 },
  { type: "cylinder", label: "Cylinder", icon: Cylinder, width: 90, height: 110 },
  { type: "hexagon", label: "Hexagon", icon: Hexagon, width: 100, height: 90 },
];

export function CollaborativeCanvas() {
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

  const { screenToFlowPosition } = useReactFlow();
  const idCounter = React.useRef(0);

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

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

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="w-full h-[calc(100vh-3.5rem)] relative bg-zinc-950"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={nodeTypes}
        fitView
        connectionMode={ConnectionMode.Loose}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#27272a"
          gap={24}
          size={1.5}
        />
        <MiniMap
          position="bottom-left"
          className="!bg-zinc-900/90 !border-zinc-800/80 !rounded-lg !shadow-xl"
          maskColor="rgba(168, 85, 247, 0.08)"
          nodeColor="#3f3f46"
        />
        <Cursors />
      </ReactFlow>

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
    </div>
  );
}
