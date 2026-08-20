"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CanvasTemplate, CANVAS_TEMPLATES } from "./starter-templates";
import { COLOR_PRESETS } from "@/types/canvas";
import { LayoutTemplate } from "lucide-react";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl bg-zinc-950 border-zinc-800 text-zinc-100 p-6">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 text-purple-400">
            <LayoutTemplate className="size-5" />
            <DialogTitle className="text-lg font-semibold tracking-wide text-zinc-100">
              Starter Templates
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            Select a pre-built architecture diagram template. Importing a template will replace all current work on this canvas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto max-h-[60vh] pr-2">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700/50 p-4 transition-all duration-200 group"
            >
              <div className="space-y-3">
                {/* SVG Preview Box */}
                <div className="relative aspect-[3/2] w-full rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
                  <TemplatePreview nodes={template.nodes} edges={template.edges} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold tracking-wide text-zinc-200 group-hover:text-purple-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                    {template.description}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  onClick={() => onImport(template)}
                  className="w-full text-xs font-semibold bg-zinc-900 hover:bg-purple-600 border border-zinc-800 hover:border-purple-500 text-zinc-300 hover:text-zinc-100 cursor-pointer h-9 transition-all duration-200"
                >
                  Import Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TemplatePreviewProps {
  nodes: any[];
  edges: any[];
}

function TemplatePreview({ nodes, edges }: TemplatePreviewProps) {
  if (nodes.length === 0) return null;

  // Calculate bounding box of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const w = node.width || 120;
    const h = node.height || 60;

    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + w > maxX) maxX = x + w;
    if (y + h > maxY) maxY = y + h;
  });

  const padding = 25;
  const boundsWidth = maxX - minX + padding * 2;
  const boundsHeight = maxY - minY + padding * 2;

  // Render container dimension mapping
  const viewWidth = 240;
  const viewHeight = 160;

  const scaleX = viewWidth / boundsWidth;
  const scaleY = viewHeight / boundsHeight;
  const scale = Math.min(scaleX, scaleY, 1);

  const contentWidth = boundsWidth * scale;
  const contentHeight = boundsHeight * scale;
  const offsetX = (viewWidth - contentWidth) / 2 + (padding - minX) * scale;
  const offsetY = (viewHeight - contentHeight) / 2 + (padding - minY) * scale;

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      className="w-full h-full"
    >
      {/* Draw edges as simple lines */}
      {edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!sourceNode || !targetNode) return null;

        const sourceW = sourceNode.width || 120;
        const sourceH = sourceNode.height || 60;
        const targetW = targetNode.width || 120;
        const targetH = targetNode.height || 60;

        const sx = (sourceNode.position.x + sourceW / 2) * scale + offsetX;
        const sy = (sourceNode.position.y + sourceH / 2) * scale + offsetY;
        const tx = (targetNode.position.x + targetW / 2) * scale + offsetX;
        const ty = (targetNode.position.y + targetH / 2) * scale + offsetY;

        return (
          <line
            key={edge.id}
            x1={sx}
            y1={sy}
            x2={tx}
            y2={ty}
            className="stroke-zinc-700/80 stroke-[1px]"
          />
        );
      })}

      {/* Draw nodes using shape types and colors */}
      {nodes.map((node) => {
        const x = node.position.x * scale + offsetX;
        const y = node.position.y * scale + offsetY;
        const w = (node.width || 120) * scale;
        const h = (node.height || 60) * scale;
        const color = node.data.color || "default";
        const shape = node.data.shape || "rectangle";
        const label = node.data.label;

        const preset = COLOR_PRESETS.find((p) => p.id === color) || COLOR_PRESETS[0];

        // Renders shape SVGs corresponding to shape types
        return (
          <g key={node.id}>
            {shape === "rectangle" && (
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={4 * scale}
                className={`${preset.svgFillClass} ${preset.svgStrokeClass} stroke-[1px]`}
              />
            )}
            {shape === "pill" && (
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={h / 2}
                className={`${preset.svgFillClass} ${preset.svgStrokeClass} stroke-[1px]`}
              />
            )}
            {shape === "circle" && (
              <ellipse
                cx={x + w / 2}
                cy={y + h / 2}
                rx={w / 2}
                ry={h / 2}
                className={`${preset.svgFillClass} ${preset.svgStrokeClass} stroke-[1px]`}
              />
            )}
            {shape === "diamond" && (
              <polygon
                points={`${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`}
                className={`${preset.svgFillClass} ${preset.svgStrokeClass} stroke-[1px]`}
              />
            )}
            {shape === "hexagon" && (
              <polygon
                points={`${x + w * 0.25},${y} ${x + w * 0.75},${y} ${x + w},${y + h / 2} ${x + w * 0.75},${y + h} ${x + w * 0.25},${y + h} ${x},${y + h / 2}`}
                className={`${preset.svgFillClass} ${preset.svgStrokeClass} stroke-[1px]`}
              />
            )}
            {shape === "cylinder" && (
              <g>
                <path
                  d={`M ${x},${y + h * 0.15} L ${x},${y + h * 0.85} A ${w / 2},${h * 0.12} 0 0,0 ${x + w},${y + h * 0.85} L ${x + w},${y + h * 0.15} A ${w / 2},${h * 0.12} 0 0,0 ${x},${y + h * 0.15} Z`}
                  className={`${preset.svgFillClass} ${preset.svgStrokeClass} stroke-[1px]`}
                />
                <ellipse
                  cx={x + w / 2}
                  cy={y + h * 0.15}
                  rx={w / 2}
                  ry={h * 0.12}
                  className={`${preset.svgFillClass} ${preset.svgStrokeClass} stroke-[1px]`}
                />
              </g>
            )}
            
            {/* Draw text label if node is big enough */}
            {w > 20 && (
              <text
                x={x + w / 2}
                y={y + h / 2 + (shape === "cylinder" ? h * 0.08 : 0)}
                dominantBaseline="middle"
                textAnchor="middle"
                className={`fill-zinc-300 font-semibold select-none pointer-events-none`}
                style={{ fontSize: Math.max(5, 7.5 * scale) + "px" }}
              >
                {label.length > 12 ? label.substring(0, 10) + ".." : label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
