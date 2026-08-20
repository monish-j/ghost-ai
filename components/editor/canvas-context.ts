import * as React from "react";
import { NodeChange, EdgeChange } from "@xyflow/react";
import { canvasNode, canvasEdge } from "@/types/canvas";

export interface CanvasContextType {
  onNodesChange?: (changes: NodeChange<canvasNode>[]) => void;
  onEdgesChange?: (changes: EdgeChange<canvasEdge>[]) => void;
}

export const CanvasContext = React.createContext<CanvasContextType | null>(null);
