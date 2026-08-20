import { Node, Edge } from "@xyflow/react";

export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: string;
}

export type canvasNode = Node<CanvasNodeData>;
export type canvasEdge = Edge;

export interface ColorPreset {
  id: string;
  name: string;
  // Non-SVG shape classes
  bgClass: string;
  borderClass: string;
  textClass: string;
  selectedBorderClass: string;
  selectedShadowClass: string;
  // SVG shape classes
  svgFillClass: string;
  svgStrokeClass: string;
  svgSelectedStrokeClass: string;
  svgSelectedFilter: string;
  // Swatch styles
  swatchBg: string;
  swatchDot: string;
  hexGlow: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "default",
    name: "Default",
    bgClass: "bg-zinc-900/90",
    borderClass: "border-zinc-800",
    textClass: "text-zinc-300",
    selectedBorderClass: "border-purple-500",
    selectedShadowClass: "shadow-[0_0_12px_rgba(168,85,247,0.35)]",
    svgFillClass: "fill-zinc-900/90",
    svgStrokeClass: "stroke-zinc-800",
    svgSelectedStrokeClass: "stroke-purple-500",
    svgSelectedFilter: "drop-shadow(0 0 6px rgba(168,85,247,0.35))",
    swatchBg: "bg-zinc-900",
    swatchDot: "bg-zinc-300",
    hexGlow: "#a1a1aa",
  },
  {
    id: "purple",
    name: "Purple",
    bgClass: "bg-purple-950/30",
    borderClass: "border-purple-500/50",
    textClass: "text-purple-200",
    selectedBorderClass: "border-purple-400",
    selectedShadowClass: "shadow-[0_0_12px_rgba(168,85,247,0.45)]",
    svgFillClass: "fill-purple-950/20",
    svgStrokeClass: "stroke-purple-500/50",
    svgSelectedStrokeClass: "stroke-purple-400",
    svgSelectedFilter: "drop-shadow(0 0 6px rgba(168,85,247,0.45))",
    swatchBg: "bg-purple-950",
    swatchDot: "bg-purple-400",
    hexGlow: "#a855f7",
  },
  {
    id: "blue",
    name: "Blue",
    bgClass: "bg-blue-950/30",
    borderClass: "border-blue-500/50",
    textClass: "text-blue-200",
    selectedBorderClass: "border-blue-400",
    selectedShadowClass: "shadow-[0_0_12px_rgba(59,130,246,0.45)]",
    svgFillClass: "fill-blue-950/20",
    svgStrokeClass: "stroke-blue-500/50",
    svgSelectedStrokeClass: "stroke-blue-400",
    svgSelectedFilter: "drop-shadow(0 0 6px rgba(59,130,246,0.45))",
    swatchBg: "bg-blue-950",
    swatchDot: "bg-blue-400",
    hexGlow: "#3b82f6",
  },
  {
    id: "green",
    name: "Green",
    bgClass: "bg-emerald-950/30",
    borderClass: "border-emerald-500/50",
    textClass: "text-emerald-200",
    selectedBorderClass: "border-emerald-400",
    selectedShadowClass: "shadow-[0_0_12px_rgba(16,185,129,0.45)]",
    svgFillClass: "fill-emerald-950/20",
    svgStrokeClass: "stroke-emerald-500/50",
    svgSelectedStrokeClass: "stroke-emerald-400",
    svgSelectedFilter: "drop-shadow(0 0 6px rgba(16,185,129,0.45))",
    swatchBg: "bg-emerald-950",
    swatchDot: "bg-emerald-400",
    hexGlow: "#10b981",
  },
  {
    id: "amber",
    name: "Amber",
    bgClass: "bg-amber-950/30",
    borderClass: "border-amber-500/50",
    textClass: "text-amber-200",
    selectedBorderClass: "border-amber-400",
    selectedShadowClass: "shadow-[0_0_12px_rgba(245,158,11,0.45)]",
    svgFillClass: "fill-amber-950/20",
    svgStrokeClass: "stroke-amber-500/50",
    svgSelectedStrokeClass: "stroke-amber-400",
    svgSelectedFilter: "drop-shadow(0 0 6px rgba(245,158,11,0.45))",
    swatchBg: "bg-amber-950",
    swatchDot: "bg-amber-400",
    hexGlow: "#f59e0b",
  },
  {
    id: "rose",
    name: "Rose",
    bgClass: "bg-rose-950/30",
    borderClass: "border-rose-500/50",
    textClass: "text-rose-200",
    selectedBorderClass: "border-rose-400",
    selectedShadowClass: "shadow-[0_0_12px_rgba(244,63,94,0.45)]",
    svgFillClass: "fill-rose-950/20",
    svgStrokeClass: "stroke-rose-500/50",
    svgSelectedStrokeClass: "stroke-rose-400",
    svgSelectedFilter: "drop-shadow(0 0 6px rgba(244,63,94,0.45))",
    swatchBg: "bg-rose-950",
    swatchDot: "bg-rose-400",
    hexGlow: "#f43f5e",
  },
  {
    id: "cyan",
    name: "Cyan",
    bgClass: "bg-cyan-950/30",
    borderClass: "border-cyan-500/50",
    textClass: "text-cyan-200",
    selectedBorderClass: "border-cyan-400",
    selectedShadowClass: "shadow-[0_0_12px_rgba(6,182,212,0.45)]",
    svgFillClass: "fill-cyan-950/20",
    svgStrokeClass: "stroke-cyan-500/50",
    svgSelectedStrokeClass: "stroke-cyan-400",
    svgSelectedFilter: "drop-shadow(0 0 6px rgba(6,182,212,0.45))",
    swatchBg: "bg-cyan-950",
    swatchDot: "bg-cyan-400",
    hexGlow: "#06b6d4",
  },
];

