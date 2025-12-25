import { useEffect, useMemo } from "react";
import { FileText, Filter, Plus, Search, Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { useHardwareDocsStore } from "../store/hardware-docs-store";
import { DocumentTypeSelector } from "./document-type-selector";
import { DocumentList } from "./document-list";
import { useFileSystemStore } from "@/features/file-system/controllers/store";
import { useHardwareDocsActions } from "../hooks/use-hardware-docs-actions";

interface HardwareDocsPanelProps {
  className?: string;
}

export function HardwareDocsPanel({ className }: HardwareDocsPanelProps) {
  const rootFolderPath = useFileSystemStore.use.rootFolderPath?.();
  const {
    searchQuery,
    filterType,
    setSearchQuery,
    setFilterType,
    getFilteredDocuments,
  } = useHardwareDocsStore();

  const { openUploadDialog } = useHardwareDocsActions();

  const filteredDocuments = useMemo(() => {
    if (!rootFolderPath) return [];
    return getFilteredDocuments(rootFolderPath);
  }, [rootFolderPath, getFilteredDocuments]);

  useEffect(() => {
    if (rootFolderPath) {
      useHardwareDocsStore.getState().setCurrentProject(rootFolderPath);
    }
  }, [rootFolderPath]);

  if (!rootFolderPath) {
    return (
      <div className={cn("flex h-full flex-col", className)}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-text">Hardware Docs</h2>
        </div>
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-center text-sm text-text-light">
            Open a project to view hardware documentation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-text">Hardware Docs</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openUploadDialog}
            className="rounded p-1.5 text-text-light transition-colors hover:bg-hover hover:text-text"
            aria-label="Upload document"
            title="Upload document"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openUploadDialog}
            className="rounded p-1.5 text-text-light transition-colors hover:bg-hover hover:text-text"
            aria-label="Add document"
            title="Add document"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-b border-border p-3">
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-md border border-border bg-primary-bg px-3 py-1.5 pl-8 text-sm text-text placeholder:text-text-lighter focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-lighter" />
          <DocumentTypeSelector value={filterType} onChange={setFilterType} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <FileText className="mb-2 h-12 w-12 text-text-lighter" />
            <p className="text-sm text-text-light">No hardware documents found</p>
            <p className="mt-1 text-xs text-text-lighter">
              Add datasheets, reference manuals, or schematics
            </p>
          </div>
        ) : (
          <DocumentList documents={filteredDocuments} />
        )}
      </div>
    </div>
  );
}
