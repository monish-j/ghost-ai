"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { COLOR_PRESETS } from "@/types/canvas";

interface ShapeRendererProps {
  shape: string;
  selected?: boolean;
  label?: string;
  showLabel?: boolean;
  color?: string;
}

export function ShapeRenderer({
  shape,
  selected = false,
  label = "",
  showLabel = true,
  color = "default",
}: ShapeRendererProps) {
  const isSvgShape = ["diamond", "hexagon", "cylinder"].includes(shape);
  const preset = COLOR_PRESETS.find((p) => p.id === color) || COLOR_PRESETS[0];

  // SVG-specific fill and stroke styles with subtle transition animations
  const svgClass = cn(
    "transition-all duration-200 stroke-[1.5px] w-full h-full",
    selected
      ? `${preset.svgFillClass} ${preset.svgSelectedStrokeClass}`
      : `${preset.svgFillClass} ${preset.svgStrokeClass} group-hover:stroke-zinc-700/80 group-hover:fill-zinc-800/40`
  );

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center text-xs font-medium transition-all duration-200 select-none group",
        isSvgShape
          ? preset.textClass
          : cn(
              "border transition-all duration-200",
              shape === "circle" && "rounded-full",
              shape === "pill" && "rounded-full",
              shape === "rectangle" && "rounded-lg",
              selected
                ? `${preset.bgClass} ${preset.selectedBorderClass} ${preset.textClass} ${preset.selectedShadowClass}`
                : `${preset.bgClass} ${preset.borderClass} ${preset.textClass} hover:brightness-110 hover:border-zinc-700/50`
            )
      )}
    >
      {/* SVG Diamond shape */}
      {shape === "diamond" && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ filter: selected ? preset.svgSelectedFilter : undefined }}
        >
          <polygon
            points="50,1 99,50 50,99 1,50"
            className={svgClass}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {/* SVG Hexagon shape */}
      {shape === "hexagon" && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ filter: selected ? preset.svgSelectedFilter : undefined }}
        >
          <polygon
            points="25,1 75,1 99,50 75,99 25,99 1,50"
            className={svgClass}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {/* SVG Cylinder shape */}
      {shape === "cylinder" && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ filter: selected ? preset.svgSelectedFilter : undefined }}
        >
          <path
            d="M 2,15 L 2,85 A 48,12 0 0,0 98,85 L 98,15 A 48,12 0 0,0 2,15 Z"
            className={svgClass}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="50"
            cy="15"
            rx="48"
            ry="12"
            className={svgClass}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {/* Centered Node Label */}
      {showLabel && (
        <div className="px-3 text-center break-words pointer-events-none w-full truncate relative z-10">
          {label || <span className="text-zinc-600 italic">Empty</span>}
        </div>
      )}
    </div>
  );
}

