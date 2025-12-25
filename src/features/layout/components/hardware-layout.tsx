import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutDashboard, PanelRight, Cpu, FileText, FolderOpen } from "lucide-react";
import { cn } from "@/utils/cn";
import AIChat from "@/features/ai/components/chat/ai-chat";
import { useChatInitialization } from "@/features/ai/hooks/use-chat-initialization";
import CodeEditor from "@/features/editor/components/code-editor";
import { useBufferStore } from "@/features/editor/stores/buffer-store";
import { useUIState } from "@/stores/ui-state-store";
import { useSettingsStore } from "@/features/settings/store";
import { useHardwareDocsStore } from "@/features/hardware-docs/store/hardware-docs-store";
import { ThreeDModelViewer } from "@/features/hardware-viewer/components/three-d-model-viewer";
import { PcbViewer } from "@/features/hardware-viewer/components/pcb-viewer";
import { TestResultViewer } from "@/features/hardware-viewer/components/test-result-viewer";
import { useHardwareContextBuilder } from "@/features/hardware-ai/hooks/use-hardware-context-builder";
import { HardwareContextBuilder } from "@/features/hardware-ai/lib/hardware-context-builder";
import { Image as ImageIcon } from "lucide-react";
import { Box } from "lucide-react";

type ViewMode = "chat" | "code" | "3d-model" | "pcb" | "test-results";

export function HardwareLayout() {
  useChatInitialization();

  const buffers = useBufferStore.use.buffers();
  const activeBufferId = useBufferStore.use.activeBufferId();
  const activeBuffer = buffers.find((b) => b.id === activeBufferId) || null;
  
  const { settings, updateSetting } = useSettingsStore();
  const [activeView, setActiveView] = useState<ViewMode>("chat");
  const [showHardwareContext, setShowHardwareContext] = useState(true);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  const hardwareContext = useMemo(() => {
    try {
      return HardwareContextBuilder.buildContext();
    } catch {
      return null;
    }
  }, [activeBuffer]);

  const hardwareContextSummary = useMemo(() => {
    if (!hardwareContext) return null;
    const ctx = hardwareContext;
    const parts: string[] = [];
    if (ctx.firmwareFiles.length > 0) parts.push(`${ctx.firmwareFiles.length} firmware files`);
    if (ctx.pcbFiles.length > 0) parts.push(`${ctx.pcbFiles.length} PCB files`);
    if (ctx.schematics.length > 0) parts.push(`${ctx.schematics.length} schematics`);
    if (ctx.testResults.length > 0) parts.push(`${ctx.testResults.length} test results`);
    if (ctx.documentationContext.trim()) parts.push("hardware documentation");
    return parts.join(" • ");
  }, [hardwareContext]);

  const toggleHardwareContext = useCallback(() => {
    setShowHardwareContext((prev) => !prev);
  }, []);

  const toggleCodeEditor = useCallback(() => {
    setShowCodeEditor((prev) => !prev);
    if (!showCodeEditor) {
      setActiveView("code");
    }
  }, [showCodeEditor]);

  const handleViewChange = useCallback((view: ViewMode) => {
    setActiveView(view);
    if (view === "code") {
      setShowCodeEditor(true);
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-primary-bg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-secondary-bg px-4 py-3">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-accent" />
          <h1 className="text-lg font-semibold text-text">Wind</h1>
          <span className="text-xs text-text-lighter">Hardware Integrated Development Environment</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleCodeEditor}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              showCodeEditor 
                ? "bg-accent text-white" 
                : "bg-hover text-text hover:bg-selected"
            )}
            aria-label="Toggle code editor"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Code</span>
          </button>
          <button
            type="button"
            onClick={() => updateSetting("isAIChatVisible", !settings.isAIChatVisible)}
            className="flex items-center gap-1.5 rounded-md bg-hover px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-selected"
            aria-label="Toggle AI chat"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area - Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* AI Chat - Primary Panel */}
        <div className="flex min-w-0 max-w-[600px] flex-col border-r border-border bg-primary-bg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-secondary-bg">
            <span className="text-sm font-medium text-text">AI Hardware Engineer</span>
            {hardwareContextSummary && (
              <button
                type="button"
                onClick={toggleHardwareContext}
                className="flex items-center gap-1.5 text-xs text-text-lighter hover:text-accent transition-colors"
                aria-label="Toggle hardware context"
              >
                <Cpu className="h-3.5 w-3.5" />
                <span className="max-w-[200px] truncate">{hardwareContextSummary}</span>
              </button>
            )}
          </div>
          
          <AIChat mode="hardware" hardwareContext={hardwareContext} />
        </div>

        {/* Right Panel - Content Views */}
        <div className="flex-1 flex-col overflow-hidden">
          {/* Hardware Context Drawer (when expanded) */}
          {showHardwareContext && hardwareContext && (
            <div className="border-b border-border bg-secondary-bg/50 px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-light uppercase tracking-wider">Hardware Context</span>
                <button
                  type="button"
                  onClick={toggleHardwareContext}
                  className="text-text-lighter hover:text-text transition-colors"
                  aria-label="Close hardware context"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs">
                {hardwareContext.firmwareFiles.length > 0 && (
                  <div className="rounded bg-primary-bg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="h-3.5 w-3.5 text-git-added" />
                      <span className="font-medium text-text">Firmware</span>
                    </div>
                    <span className="text-text-lighter">{hardwareContext.firmwareFiles.length} files</span>
                  </div>
                )}
                {hardwareContext.pcbFiles.length > 0 && (
                  <div className="rounded bg-primary-bg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Box className="h-3.5 w-3.5 text-git-modified" />
                      <span className="font-medium text-text">PCB</span>
                    </div>
                    <span className="text-text-lighter">{hardwareContext.pcbFiles.length} files</span>
                  </div>
                )}
                {hardwareContext.schematics.length > 0 && (
                  <div className="rounded bg-primary-bg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ImageIcon className="h-3.5 w-3.5 text-git-deleted" />
                      <span className="font-medium text-text">Schematics</span>
                    </div>
                    <span className="text-text-lighter">{hardwareContext.schematics.length} files</span>
                  </div>
                )}
                {hardwareContext.testResults.length > 0 && (
                  <div className="rounded bg-primary-bg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Cpu className="h-3.5 w-3.5 text-git-renamed" />
                      <span className="font-medium text-text">Tests</span>
                    </div>
                    <span className="text-text-lighter">{hardwareContext.testResults.length} files</span>
                  </div>
                )}
                {hardwareContext.documentationContext.trim() && (
                  <div className="col-span-4 rounded bg-primary-bg p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="h-3.5 w-3.5 text-text-light" />
                      <span className="font-medium text-text">Documentation Loaded</span>
                    </div>
                    <p className="line-clamp-2 text-text-lighter">
                      Register maps, timing constraints, and electrical specs available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Viewer */}
          <div className="flex-1 overflow-hidden">
            {(() => {
              if (showCodeEditor || activeView === "code") {
                if (!activeBuffer || activeBuffer.is3DModel || activeBuffer.isPcbViewer || activeBuffer.isTestResult) {
                  return (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <FolderOpen className="mx-auto mb-3 h-12 w-12 text-text-lighter" />
                        <p className="text-sm text-text-light">Open a file to view or edit code</p>
                        <p className="mt-2 text-xs text-text-lighter">
                          Open firmware files, PCB designs, 3D models, or test results
                        </p>
                      </div>
                    </div>
                  );
                }
                return <CodeEditor />;
              }
              if (activeView === "3d-model" && activeBuffer?.is3DModel) {
                return <ThreeDModelViewer filePath={activeBuffer.path} />;
              }
              if (activeView === "pcb" && activeBuffer?.isPcbViewer) {
                return <PcbViewer filePath={activeBuffer.path} pcbData={activeBuffer.pcbData} />;
              }
              if (activeView === "test-results" && activeBuffer?.isTestResult) {
                return <TestResultViewer testData={activeBuffer.testData} />;
              }
              if (!activeBuffer) {
                return (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center max-w-md px-8">
                      <LayoutDashboard className="mx-auto mb-4 h-16 w-16 text-text-lighter" />
                      <h2 className="mb-2 text-lg font-semibold text-text">Start Your Hardware Project</h2>
                      <p className="mb-6 text-sm text-text-light">
                        Wind is your AI-powered hardware engineering environment. Describe what you want to build, and let the AI agent help you with:
                      </p>
                      <ul className="mb-6 space-y-2 text-left text-sm text-text-light">
                        <li className="flex items-start gap-2">
                          <span className="text-success mt-0.5">✓</span>
                          <span>Firmware development for embedded systems</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-success mt-0.5">✓</span>
                          <span>PCB design and validation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-success mt-0.5">✓</span>
                          <span>3D modeling and simulation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-success mt-0.5">✓</span>
                          <span>Hardware testing and debugging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-success mt-0.5">✓</span>
                          <span>Context-aware AI assistance</span>
                        </li>
                      </ul>
                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          className="rounded bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                        >
                          New Hardware Project
                        </button>
                        <p className="text-xs text-text-lighter">
                          Or drag and drop an existing project folder
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-text-light">Select a view or open a file</p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
