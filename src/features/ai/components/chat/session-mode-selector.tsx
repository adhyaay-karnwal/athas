import { Cpu, Zap, TestTube, Box, LayoutDashboard } from "lucide-react";
import { cn } from "@/utils/cn";
import Tooltip from "@/ui/tooltip";
import { useAIChatStore } from "@/features/ai/store/store";
import type { SessionMode } from "@/features/hardware-ai/lib/hardware-slash-commands";

const HARDWARE_SESSION_MODES = [
  { id: "firmware-dev", name: "Firmware", icon: Cpu },
  { id: "hardware-design", name: "Hardware", icon: Box },
  { id: "testing-verification", name: "Testing", icon: TestTube },
  { id: "debugging", name: "Debugging", icon: Zap },
  { id: "full-stack-hardware", name: "Full-Stack", icon: LayoutDashboard },
];

export function SessionModeSelector() {
  const selectedMode = useAIChatStore((state) => state.sessionModeState.currentModeId);
  const setMode = useAIChatStore((state) => state.setSessionMode);

  return (
    <div className="flex items-center gap-0.5">
      {HARDWARE_SESSION_MODES.map((mode) => (
        <Tooltip key={mode.id} content={mode.name} side="right">
          <button
            type="button"
            onClick={() => setMode(mode.id)}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors",
              selectedMode === mode.id
                ? "bg-selected text-text"
                : "text-text-lighter hover:bg-hover hover:text-text",
            )}
            aria-label={`Switch to ${mode.name} mode`}
          >
            <mode.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{mode.name}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
