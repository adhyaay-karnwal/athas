import { useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, readBinaryFile } from "@tauri-apps/plugin-fs";
import { useHardwareDocsStore } from "../store/hardware-docs-store";
import { DocumentProcessor } from "../utils/document-processor";
import type { DocumentType, HardwareDocument } from "../types/hardware-docs";
import { useFileSystemStore } from "@/features/file-system/controllers/store";
import { getMimeType } from "@/utils/file-helpers";

export function useHardwareDocsActions() {
  const rootFolderPath = useFileSystemStore.use.rootFolderPath?.();
  const {
    addDocument,
    setProcessing,
    updateExtractedData,
    getProjectDocuments,
  } = useHardwareDocsStore();

  const openUploadDialog = useCallback(async () => {
    if (!rootFolderPath) {
      console.error("No project opened");
      return;
    }

    const selected = await open({
      multiple: true,
      filters: [
        {
          name: "Hardware Documents",
          extensions: ["pdf", "txt", "csv", "json", "xml", "md", "sch", "kicad_pcb", "stl", "step", "obj"],
        },
        {
          name: "PDF",
          extensions: ["pdf"],
        },
        {
          name: "Text Files",
          extensions: ["txt", "csv", "md"],
        },
        {
          name: "KiCad Files",
          extensions: ["kicad_pcb", "sch"],
        },
        {
          name: "3D Models",
          extensions: ["stl", "step", "obj"],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    if (!selected) return;

    const files = Array.isArray(selected) ? selected : [selected];

    for (const filePath of files) {
      await uploadDocument(filePath);
    }
  }, [rootFolderPath, addDocument, setProcessing, updateExtractedData]);

  const uploadDocument = useCallback(
    async (filePath: string) => {
      if (!rootFolderPath) return;

      try {
        const fileName = filePath.split("/").pop() ?? filePath.split("\\").pop() ?? "Unknown";
        const fileType = determineDocumentType(fileName);
        const mimeType = getMimeType(fileName);

        let fileSize = 0;
        try {
          const contents = await readBinaryFile(filePath);
          fileSize = contents.length;
        } catch {
          fileSize = 0;
        }

        const document: HardwareDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          projectId: rootFolderPath,
          name: fileName,
          type: fileType,
          filePath,
          fileSize,
          uploadedAt: new Date(),
          lastAccessed: new Date(),
          metadata: {
            tags: [],
          },
        };

        setProcessing(true, document.id);
        addDocument(rootFolderPath, document);

        try {
          const metadata = await DocumentProcessor.extractMetadata(filePath, mimeType);
          useHardwareDocsStore.getState().updateDocument(rootFolderPath, document.id, { metadata });

          const extractedData = await DocumentProcessor.extractData(document);
          updateExtractedData(rootFolderPath, document.id, extractedData);
        } catch (error) {
          console.error("Failed to process document:", error);
        } finally {
          setProcessing(false, null);
        }
      } catch (error) {
        console.error("Failed to upload document:", error);
      }
    },
    [rootFolderPath, addDocument, setProcessing, updateExtractedData],
  );

  const getHardwareContextForAI = useCallback((): string => {
    if (!rootFolderPath) return "";

    const documents = getProjectDocuments(rootFolderPath);
    const contextParts: string[] = [];

    for (const doc of documents) {
      if (doc.extractedData) {
        contextParts.push(`# ${doc.name} (${doc.type})\n`);
        contextParts.push(DocumentProcessor.formatForAI(doc.extractedData));
        contextParts.push("\n");
      }
    }

    if (contextParts.length > 0) {
      return `## Hardware Documentation Context\n\n${contextParts.join("\n")}`;
    }

    return "";
  }, [rootFolderPath, getProjectDocuments]);

  return {
    openUploadDialog,
    uploadDocument,
    getHardwareContextForAI,
  };
}

function determineDocumentType(fileName: string): DocumentType {
  const lowerName = fileName.toLowerCase();

  if (lowerName.includes("datasheet")) {
    return "datasheet";
  }
  if (lowerName.includes("reference") || lowerName.includes("manual") || lowerName.includes("rm")) {
    return "reference-manual";
  }
  if (
    lowerName.endsWith(".sch") ||
    lowerName.endsWith(".kicad_sch") ||
    lowerName.endsWith(".pdf") && lowerName.includes("schematic")
  ) {
    return "schematic";
  }
  if (lowerName.includes("company") || lowerName.includes("knowledge") || lowerName.includes("wiki")) {
    return "company-knowledge";
  }

  if (lowerName.endsWith(".pdf")) {
    return "datasheet";
  }

  return "other";
}
