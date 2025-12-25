import { useEffect, useRef, useState } from "react";
import { Cube, Maximize2, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ThreeDModelData } from "../types/hardware-viewer";
import { invoke } from "@tauri-apps/api/core";

interface ThreeDModelViewerProps {
  filePath: string;
  className?: string;
}

export function ThreeDModelViewer({ filePath, className }: ThreeDModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelData, setModelData] = useState<ThreeDModelData | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadModel();
  }, [filePath]);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await invoke<ThreeDModelData>("load_3d_model", {
        filePath,
      });

      setModelData(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load 3D model");
      setIsLoading(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.max(0.1, Math.min(5, prev - e.deltaY * 0.001)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      const startX = e.clientX;
      const startY = e.clientY;
      const startRotation = { ...rotation };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        setRotation({
          x: startRotation.x + (moveEvent.clientY - startY) * 0.01,
          y: startRotation.y + (moveEvent.clientX - startX) * 0.01,
        });
      };

      const handleMouseUp = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  if (isLoading) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-text-light">Loading 3D model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <Cube className="h-12 w-12 text-error" />
          <p className="text-sm text-error">{error}</p>
          <button
            type="button"
            onClick={loadModel}
            className="rounded bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative flex h-full flex-col", className)}>
      <div className="absolute right-2 top-2 z-10 flex gap-1">
        <button
          type="button"
          onClick={() => setZoom((prev) => Math.min(5, prev + 0.2))}
          className="rounded bg-secondary-bg/80 p-1.5 text-text backdrop-blur hover:bg-hover"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((prev) => Math.max(0.1, prev - 0.2))}
          className="rounded bg-secondary-bg/80 p-1.5 text-text backdrop-blur hover:bg-hover"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded bg-secondary-bg/80 p-1.5 text-text backdrop-blur hover:bg-hover"
          aria-label="Reset view"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded bg-secondary-bg/80 p-1.5 text-text backdrop-blur hover:bg-hover"
          aria-label="Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center bg-primary-bg">
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          className="cursor-move"
          style={{
            transform: `scale(${zoom}) rotateX(${rotation.x}rad) rotateY(${rotation.y}rad)`,
            transformStyle: "preserve-3d",
          }}
        />
      </div>

      <div className="border-t border-border bg-secondary-bg px-4 py-2">
        <div className="flex items-center justify-between text-xs text-text-light">
          <span>{modelData?.vertices.length / 3} vertices</span>
          <span>Zoom: {zoom.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
}
