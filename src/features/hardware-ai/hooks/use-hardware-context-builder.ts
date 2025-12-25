import { useCallback, useMemo } from "react";
import { useHardwareDocsStore } from "@/features/hardware-docs/store/hardware-docs-store";
import { useFileSystemStore } from "@/features/file-system/controllers/store";
import { DocumentProcessor } from "@/features/hardware-docs/utils/document-processor";

export interface HardwareContext {
  documentationContext: string;
  firmwareFiles: string[];
  pcbFiles: string[];
  schematics: string[];
  testResults: string[];
  summary: string;
}

export function useHardwareContextBuilder() {
  const rootFolderPath = useFileSystemStore.use.rootFolderPath?.();

  const buildContext = useCallback((): HardwareContext => {
    if (!rootFolderPath) {
      return {
        documentationContext: "",
        firmwareFiles: [],
        pcbFiles: [],
        schematics: [],
        testResults: [],
        summary: "No project is currently open.",
      };
    }

    const hardwareContext: HardwareContext = {
      documentationContext: "",
      firmwareFiles: [],
      pcbFiles: [],
      schematics: [],
      testResults: [],
      summary: "",
    };

    // Get extracted data from hardware documentation
    const extractedData = useHardwareDocsStore.getState().getAllExtractedData(rootFolderPath);
    hardwareContext.documentationContext = DocumentProcessor.formatForAI(extractedData);

    // Identify firmware files
    const files = useFileSystemStore.getState().files();
    const firmwareExtensions = [".c", ".cpp", ".h", ".hpp", ".ino", ".pde", ".S", ".s", ".ld", ".mk", "Makefile", "CMakeLists.txt"];
    const traverseForFirmware = (entries: typeof files, results: string[]) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverseForFirmware(entry.children, results);
        } else if (entry.isFile) {
          const ext = entry.name.split(".").pop()?.toLowerCase();
          if (ext && firmwareExtensions.includes(`.${ext}`)) {
            results.push(entry.path);
          } else if (entry.name === "Makefile" || entry.name === "CMakeLists.txt") {
            results.push(entry.path);
          }
        }
      }
    };
    traverseForFirmware(files, hardwareContext.firmwareFiles);

    // Identify PCB files
    const pcbExtensions = [".kicad_pcb", ".kicad_mod", ".brd", ".sch", ".gbr", ".gtl", ".gbl", ".gbo", ".gbs", ".gto", ".gts"];
    const traverseForPCB = (entries: typeof files, results: string[]) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverseForPCB(entry.children, results);
        } else if (entry.isFile) {
          const lowerName = entry.name.toLowerCase();
          if (pcbExtensions.some((pcbExt) => lowerName.endsWith(pcbExt))) {
            results.push(entry.path);
          }
        }
      }
    };
    traverseForPCB(files, hardwareContext.pcbFiles);

    // Identify schematics
    const schematicExtensions = [".sch", ".kicad_sch", ".pdf"];
    const traverseForSchematics = (entries: typeof files, results: string[]) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverseForSchematics(entry.children, results);
        } else if (entry.isFile) {
          const lowerName = entry.name.toLowerCase();
          if (
            schematicExtensions.some((ext) => lowerName.endsWith(ext)) &&
            (lowerName.includes("schematic") || lowerName.includes("circuit"))
          ) {
            results.push(entry.path);
          }
        }
      }
    };
    traverseForSchematics(files, hardwareContext.schematics);

    // Identify test results
    const testExtensions = [".xml", ".json", ".log", ".txt"];
    const traverseForTests = (entries: typeof files, results: string[]) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverseForTests(entry.children, results);
        } else if (entry.isFile) {
          const lowerName = entry.name.toLowerCase();
          if (
            (lowerName.includes("test") || lowerName.includes("result") || lowerName.includes("report")) &&
            testExtensions.some((ext) => lowerName.endsWith(ext))
          ) {
            results.push(entry.path);
          }
        }
      }
    };
    traverseForTests(files, hardwareContext.testResults);

    // Build summary
    const summaryParts: string[] = [];
    if (hardwareContext.documentationContext.trim()) {
      summaryParts.push("Hardware documentation available");
    }
    if (hardwareContext.firmwareFiles.length > 0) {
      summaryParts.push(`${hardwareContext.firmwareFiles.length} firmware files`);
    }
    if (hardwareContext.pcbFiles.length > 0) {
      summaryParts.push(`${hardwareContext.pcbFiles.length} PCB files`);
    }
    if (hardwareContext.schematics.length > 0) {
      summaryParts.push(`${hardwareContext.schematics.length} schematics`);
    }
    if (hardwareContext.testResults.length > 0) {
      summaryParts.push(`${hardwareContext.testResults.length} test results`);
    }
    hardwareContext.summary = summaryParts.length > 0 
      ? `## Hardware Project Summary\n\n${summaryParts.join(" • ")}`
      : "No hardware-specific files detected in this project.";

    return hardwareContext;
  }, [rootFolderPath]);

  const hardwareContext = useMemo(() => {
    return buildContext();
  }, [buildContext]);

  return { hardwareContext, buildContext };
}
