import { Node, Edge } from "@xyflow/react";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: string;
}

export type canvasNode = Node<CanvasNodeData>;
export type canvasEdge = Edge;
