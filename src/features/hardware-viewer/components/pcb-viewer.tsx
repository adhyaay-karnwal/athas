import { useState } from "react";
import { Cpu, Layers, Zap } from "lucide-react";
import { cn } from "@/utils/cn";
import type { PCBViewerData } from "../types/hardware-viewer";
import { invoke } from "@tauri-apps/api/core";

interface PcbViewerProps {
  filePath: string;
  pcbData?: unknown;
}

export function PcbViewer({ filePath, pcbData }: PcbViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PCBViewerData | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const loadPCBData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const pcbData = await invoke<PCBViewerData>("load_pcb_design", {
        filePath,
      });

      setData(pcbData);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PCB design");
      setIsLoading(false);
    }
  };

  useState(() => {
    if (pcbData) {
      setData(pcbData as PCBViewerData);
      setIsLoading(false);
    } else {
      loadPCBData();
    }
  }, [pcbData, filePath]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-text-light">Loading PCB design...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <Cpu className="h-12 w-12 text-error" />
          <p className="text-sm text-error">{error}</p>
          <button
            type="button"
            onClick={loadPCBData}
            className="rounded bg-accent px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-light">No PCB data available</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-secondary-bg px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text">PCB Viewer</span>
          <span className="text-xs text-text-lighter">{data?.components.length ?? 0} components</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-text-lighter" />
          <select
            value={activeLayer ?? ""}
            onChange={(e) => setActiveLayer(e.target.value || null)}
            className="rounded border border-border bg-primary-bg px-2 py-1 text-xs text-text"
          >
            <option value="">All Layers</option>
            {data?.layers.map((layer) => (
              <option key={layer} value={layer}>
                {layer}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 bg-primary-bg">
        {data ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Zap className="mx-auto mb-2 h-12 w-12 text-text-lighter" />
              <p className="text-sm text-text-light">PCB visualization placeholder</p>
              <p className="mt-1 text-xs text-text-lighter">
                Full PCB viewer implementation will load and render {data.components.length} components
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-text-light">No PCB data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
