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

export class HardwareContextBuilder {
  static buildContext(): HardwareContext {
    const rootFolderPath = useFileSystemStore.getState().rootFolderPath?.();
    if (!rootFolderPath) {
      return this.getEmptyContext();
    }

    const hardwareContext: HardwareContext = {
      documentationContext: "",
      firmwareFiles: [],
      pcbFiles: [],
      schematics: [],
      testResults: [],
      summary: "",
    };

    hardwareContext.documentationContext = this.buildDocumentationContext(rootFolderPath);
    hardwareContext.firmwareFiles = this.identifyFirmwareFiles(rootFolderPath);
    hardwareContext.pcbFiles = this.identifyPCBFiles(rootFolderPath);
    hardwareContext.schematics = this.identifySchematics(rootFolderPath);
    hardwareContext.testResults = this.identifyTestResults(rootFolderPath);
    hardwareContext.summary = this.buildSummary(hardwareContext);

    return hardwareContext;
  }

  private static buildDocumentationContext(projectId: string): string {
    const extractedData = useHardwareDocsStore.getState().getAllExtractedData(projectId);
    return DocumentProcessor.formatForAI(extractedData);
  }

  private static identifyFirmwareFiles(projectId: string): string[] {
    const files = useFileSystemStore.getState().files();
    const firmwareExtensions = [
      ".c",
      ".cpp",
      ".h",
      ".hpp",
      ".ino",
      ".pde",
      ".S",
      ".s",
      ".ld",
      ".mk",
      "Makefile",
      "CMakeLists.txt",
    ];

    const firmwareFiles: string[] = [];
    const traverse = (entries: typeof files) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverse(entry.children);
        } else if (entry.isFile) {
          const ext = entry.name.split(".").pop()?.toLowerCase();
          if (ext && firmwareExtensions.includes(`.${ext}`)) {
            firmwareFiles.push(entry.path);
          } else if (entry.name === "Makefile" || entry.name === "CMakeLists.txt") {
            firmwareFiles.push(entry.path);
          }
        }
      }
    };

    traverse(files);
    return firmwareFiles;
  }

  private static identifyPCBFiles(projectId: string): string[] {
    const files = useFileSystemStore.getState().files();
    const pcbExtensions = [
      ".kicad_pcb",
      ".kicad_mod",
      ".brd",
      ".sch",
      ".gbr",
      ".gtl",
      ".gbl",
      ".gbo",
      ".gbs",
      ".gto",
      ".gts",
    ];

    const pcbFiles: string[] = [];
    const traverse = (entries: typeof files) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverse(entry.children);
        } else if (entry.isFile) {
          const ext = entry.name.split(".").pop()?.toLowerCase();
          if (ext && pcbExtensions.some((pcbExt) => entry.name.endsWith(pcbExt))) {
            pcbFiles.push(entry.path);
          }
        }
      }
    };

    traverse(files);
    return pcbFiles;
  }

  private static identifySchematics(projectId: string): string[] {
    const files = useFileSystemStore.getState().files();
    const schematicExtensions = [".sch", ".kicad_sch", ".pdf"];

    const schematics: string[] = [];
    const traverse = (entries: typeof files) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverse(entry.children);
        } else if (entry.isFile) {
          const lowerName = entry.name.toLowerCase();
          if (
            schematicExtensions.some((ext) => lowerName.endsWith(ext)) &&
            (lowerName.includes("schematic") || lowerName.includes("circuit"))
          ) {
            schematics.push(entry.path);
          }
        }
      }
    };

    traverse(files);
    return schematics;
  }

  private static identifyTestResults(projectId: string): string[] {
    const files = useFileSystemStore.getState().files();
    const testExtensions = [".xml", ".json", ".log", ".txt"];

    const testResults: string[] = [];
    const traverse = (entries: typeof files) => {
      for (const entry of entries) {
        if (entry.isDir && entry.children) {
          traverse(entry.children);
        } else if (entry.isFile) {
          const lowerName = entry.name.toLowerCase();
          if (
            (lowerName.includes("test") || lowerName.includes("result") || lowerName.includes("report")) &&
            testExtensions.some((ext) => lowerName.endsWith(ext))
          ) {
            testResults.push(entry.path);
          }
        }
      }
    };

    traverse(files);
    return testResults;
  }

  private static buildSummary(context: HardwareContext): string {
    const parts: string[] = [];

    const docContext = context.documentationContext;
    if (docContext && docContext.trim()) {
      parts.push("Hardware documentation is available with register maps, timing constraints, and pinouts.");
    }

    if (context.firmwareFiles.length > 0) {
      parts.push(`${context.firmwareFiles.length} firmware source files detected.`);
    }

    if (context.pcbFiles.length > 0) {
      parts.push(`${context.pcbFiles.length} PCB design files detected.`);
    }

    if (context.schematics.length > 0) {
      parts.push(`${context.schematics.length} schematic files detected.`);
    }

    if (context.testResults.length > 0) {
      parts.push(`${context.testResults.length} test result files detected.`);
    }

    if (parts.length === 0) {
      return "No hardware-specific files or documentation detected in this project.";
    }

    return `## Hardware Project Summary\n\n${parts.join("\n")}`;
  }

  private static getEmptyContext(): HardwareContext {
    return {
      documentationContext: "",
      firmwareFiles: [],
      pcbFiles: [],
      schematics: [],
      testResults: [],
      summary: "No project is currently open.",
    };
  }

  static formatForAI(context: HardwareContext): string {
    const sections: string[] = [];

    sections.push(context.summary);
    sections.push("");

    if (context.documentationContext.trim()) {
      sections.push("### Hardware Documentation");
      sections.push(context.documentationContext);
      sections.push("");
    }

    if (context.firmwareFiles.length > 0) {
      sections.push("### Firmware Files");
      context.firmwareFiles.slice(0, 20).forEach((file) => {
        sections.push(`- ${file}`);
      });
      if (context.firmwareFiles.length > 20) {
        sections.push(`... and ${context.firmwareFiles.length - 20} more`);
      }
      sections.push("");
    }

    if (context.pcbFiles.length > 0) {
      sections.push("### PCB Design Files");
      context.pcbFiles.slice(0, 20).forEach((file) => {
        sections.push(`- ${file}`);
      });
      if (context.pcbFiles.length > 20) {
        sections.push(`... and ${context.pcbFiles.length - 20} more`);
      }
      sections.push("");
    }

    if (context.schematics.length > 0) {
      sections.push("### Schematic Files");
      context.schematics.slice(0, 20).forEach((file) => {
        sections.push(`- ${file}`);
      });
      if (context.schematics.length > 20) {
        sections.push(`... and ${context.schematics.length - 20} more`);
      }
      sections.push("");
    }

    if (context.testResults.length > 0) {
      sections.push("### Test Results");
      context.testResults.slice(0, 20).forEach((file) => {
        sections.push(`- ${file}`);
      });
      if (context.testResults.length > 20) {
        sections.push(`... and ${context.testResults.length - 20} more`);
      }
      sections.push("");
    }

    return sections.join("\n");
  }
}
