import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

interface UseKeyboardShortcutsProps {
  reactFlowInstance: ReturnType<typeof useReactFlow>;
  undo: () => void;
  redo: () => void;
}

export function useKeyboardShortcuts({
  reactFlowInstance,
  undo,
  redo,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts while typing in inputs, textareas, or editable text fields
      const target = event.target as HTMLElement;
      if (
        !target ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("[contenteditable]")
      ) {
        return;
      }

      const isMac = typeof window !== "undefined" && /mac/i.test(navigator.userAgent);
      const isCmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Check shortcuts:
      // + or = to zoom in
      if ((event.key === "+" || event.key === "=") && !isCmdOrCtrl) {
        event.preventDefault();
        reactFlowInstance.zoomIn({ duration: 200 });
      }
      // - to zoom out
      else if (event.key === "-" && !isCmdOrCtrl) {
        event.preventDefault();
        reactFlowInstance.zoomOut({ duration: 200 });
      }
      // Cmd/Ctrl + Shift + Z to redo
      else if (isCmdOrCtrl && event.shiftKey && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        redo();
      }
      // Cmd/Ctrl + Z to undo
      else if (isCmdOrCtrl && !event.shiftKey && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Y to redo
      else if (isCmdOrCtrl && !event.shiftKey && (event.key === "y" || event.key === "Y")) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reactFlowInstance, undo, redo]);
}
