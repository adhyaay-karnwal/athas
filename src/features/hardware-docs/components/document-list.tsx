import { FileText, Clock, Tag } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatDistanceToNow } from "dayjs";
import type { HardwareDocument } from "../types/hardware-docs";
import { useHardwareDocsStore } from "../store/hardware-docs-store";
import { DocumentProcessor } from "../utils/document-processor";

interface DocumentListProps {
  documents: HardwareDocument[];
}

export function DocumentList({ documents }: DocumentListProps) {
  const { setSelectedDocument, setDocumentViewerOpen, removeDocument } = useHardwareDocsStore();

  const handleDocumentClick = (document: HardwareDocument) => {
    setSelectedDocument(document.id);
    setDocumentViewerOpen(true);
  };

  const handleRemoveDocument = (e: React.MouseEvent, documentId: string, projectId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this document?")) {
      removeDocument(projectId, documentId);
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "datasheet":
        return "text-git-modified";
      case "reference-manual":
        return "text-git-added";
      case "schematic":
        return "text-git-deleted";
      case "company-knowledge":
        return "text-git-renamed";
      default:
        return "text-text";
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {documents.map((doc) => (
        <button
          type="button"
          key={doc.id}
          onClick={() => handleDocumentClick(doc)}
          className={cn(
            "group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-hover",
            "border-b border-border last:border-b-0",
          )}
        >
          <div
            className={cn(
              "mt-0.5 shrink-0",
              getDocumentTypeColor(doc.type),
            )}
          >
            {getDocumentTypeIcon(doc.type)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <div className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-text">{doc.name}</span>
              {doc.extractedData && (
                <span className="shrink-0 rounded-full bg-git-added/20 px-1.5 py-0.5 text-xs text-git-added">
                  Extracted
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-lighter">
              <span className="capitalize">{doc.type.replace("-", " ")}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(doc.lastAccessed, { addSuffix: true })}
              </span>
            </div>
            {doc.metadata.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {doc.metadata.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded bg-secondary-bg px-1.5 py-0.5 text-xs text-text-lighter"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
                {doc.metadata.tags.length > 3 && (
                  <span className="text-xs text-text-lighter">
                    +{doc.metadata.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            {doc.extractedData && (
              <div className="mt-2 rounded border border-border bg-secondary-bg px-2 py-1">
                <p className="text-xs text-text-lighter">
                  {DocumentProcessor.getContextSummary(doc.extractedData)}
                </p>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
