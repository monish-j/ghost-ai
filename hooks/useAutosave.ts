import { useEffect, useRef, useState, useCallback } from "react";
import { canvasNode, canvasEdge } from "@/types/canvas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveProps {
  projectId: string;
  nodes: canvasNode[];
  edges: canvasEdge[];
  isInitialized: boolean;
  debounceMs?: number;
}

export function useAutosave({
  projectId,
  nodes,
  edges,
  isInitialized,
  debounceMs = 2000,
}: UseAutosaveProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of the last saved state to prevent saving if nothing changed
  const lastSavedStateRef = useRef<string>("");

  const saveCanvas = useCallback(async () => {
    // Collect the latest canvas state
    const currentStateStr = JSON.stringify({ nodes, edges });
    
    // Optimistic skip if already saved
    if (currentStateStr === lastSavedStateRef.current) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: currentStateStr,
      });

      if (!response.ok) {
        throw new Error("Failed to save canvas");
      }

      lastSavedStateRef.current = currentStateStr;
      setSaveStatus("saved");
    } catch (error) {
      console.error("Autosave error:", error);
      setSaveStatus("error");
    }
  }, [projectId, nodes, edges]);

  // Debounced effect for autosave
  useEffect(() => {
    // Only autosave once the initial canvas has loaded/initialized
    if (!isInitialized) {
      // Establish baseline state so that we don't save initial state immediately
      lastSavedStateRef.current = JSON.stringify({ nodes, edges });
      return;
    }

    const currentStateStr = JSON.stringify({ nodes, edges });
    
    // If the state is identical to what's already saved, don't trigger saving
    if (currentStateStr === lastSavedStateRef.current) {
      return;
    }

    setSaveStatus("saving");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveCanvas();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, isInitialized, debounceMs, saveCanvas]);

  return {
    saveStatus,
    saveCanvas,
  };
}
