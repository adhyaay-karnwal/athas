import type { ExtractedData, HardwareDocument, DocumentMetadata } from "../types/hardware-docs";
import { invoke } from "@tauri-apps/api/core";

export class DocumentProcessor {
  static async extractMetadata(filePath: string, fileType: string): Promise<DocumentMetadata> {
    try {
      const result = await invoke<Record<string, any>>("extract_document_metadata", {
        filePath,
        fileType,
      });

      return {
        title: result.title,
        author: result.author,
        version: result.version,
        revision: result.revision,
        pages: result.pages,
        manufacturer: result.manufacturer,
        partNumber: result.partNumber,
        description: result.description,
        tags: result.tags ?? [],
      };
    } catch (error) {
      console.error("Failed to extract metadata:", error);
      return {
        tags: [],
      };
    }
  }

  static async extractData(document: HardwareDocument): Promise<ExtractedData> {
    try {
      const result = await invoke<Record<string, any>>("extract_hardware_data", {
        filePath: document.filePath,
        fileType: document.type,
      });

      return {
        registerMaps: result.registerMaps,
        timingConstraints: result.timingConstraints,
        pinouts: result.pinouts,
        electricalSpecs: result.electricalSpecs,
        configurations: result.configurations,
        summary: result.summary,
      };
    } catch (error) {
      console.error("Failed to extract hardware data:", error);
      return {};
    }
  }

  static formatForAI(extractedData: ExtractedData): string {
    const sections: string[] = [];

    if (extractedData.summary) {
      sections.push(`## Document Summary\n${extractedData.summary}\n`);
    }

    if (extractedData.registerMaps && extractedData.registerMaps.length > 0) {
      sections.push("## Register Maps\n");
      for (const regMap of extractedData.registerMaps) {
        sections.push(`### ${regMap.name}\n`);
        sections.push(`- Address: ${regMap.address}\n`);
        sections.push(`- Description: ${regMap.description}\n`);
        sections.push(`- Bit Width: ${regMap.bitWidth}\n`);
        sections.push(`- Access: ${regMap.access}\n`);
        if (regMap.resetValue) {
          sections.push(`- Reset Value: ${regMap.resetValue}\n`);
        }
        if (regMap.fields && regMap.fields.length > 0) {
          sections.push("**Fields:**\n");
          for (const field of regMap.fields) {
            sections.push(`  - ${field.name} [${field.bitRange[0]}:${field.bitRange[1]}]: ${field.description}\n`);
            if (field.enumValues && field.enumValues.length > 0) {
              sections.push(`    - Enum values:\n`);
              for (const enumVal of field.enumValues) {
                sections.push(`      - ${enumVal.value}: ${enumVal.description}\n`);
              }
            }
          }
        }
        sections.push("\n");
      }
    }

    if (extractedData.timingConstraints && extractedData.timingConstraints.length > 0) {
      sections.push("## Timing Constraints\n");
      for (const timing of extractedData.timingConstraints) {
        sections.push(`### ${timing.name}\n`);
        sections.push(`- Parameter: ${timing.parameter}\n`);
        if (timing.min !== undefined) {
          sections.push(`- Min: ${timing.min} ${timing.unit}\n`);
        }
        if (timing.typ !== undefined) {
          sections.push(`- Typ: ${timing.typ} ${timing.unit}\n`);
        }
        if (timing.max !== undefined) {
          sections.push(`- Max: ${timing.max} ${timing.unit}\n`);
        }
        if (timing.condition) {
          sections.push(`- Condition: ${timing.condition}\n`);
        }
        sections.push("\n");
      }
    }

    if (extractedData.pinouts && extractedData.pinouts.length > 0) {
      sections.push("## Pinouts\n");
      for (const pin of extractedData.pinouts) {
        sections.push(`- ${pin.pinNumber}: ${pin.name} (${pin.type})`);
        if (pin.description) {
          sections.push(` - ${pin.description}`);
        }
        if (pin.function) {
          sections.push(` [${pin.function}]`);
        }
        sections.push("\n");
      }
      sections.push("\n");
    }

    if (extractedData.electricalSpecs && extractedData.electricalSpecs.length > 0) {
      sections.push("## Electrical Specifications\n");
      for (const spec of extractedData.electricalSpecs) {
        sections.push(`### ${spec.parameter}\n`);
        if (spec.min !== undefined) {
          sections.push(`- Min: ${spec.min} ${spec.unit}\n`);
        }
        if (spec.typ !== undefined) {
          sections.push(`- Typ: ${spec.typ} ${spec.unit}\n`);
        }
        if (spec.max !== undefined) {
          sections.push(`- Max: ${spec.max} ${spec.unit}\n`);
        }
        if (spec.condition) {
          sections.push(`- Condition: ${spec.condition}\n`);
        }
        sections.push("\n");
      }
    }

    if (extractedData.configurations && extractedData.configurations.length > 0) {
      sections.push("## Configurations\n");
      for (const config of extractedData.configurations) {
        sections.push(`### ${config.name}\n`);
        sections.push(`- Description: ${config.description}\n`);
        sections.push("**Settings:**\n");
        for (const [key, value] of Object.entries(config.settings)) {
          sections.push(`  - ${key}: ${value}\n`);
        }
        sections.push("\n");
      }
    }

    return sections.join("");
  }

  static getContextSummary(extractedData: ExtractedData): string {
    const parts: string[] = [];

    const regCount = extractedData.registerMaps?.length ?? 0;
    const timingCount = extractedData.timingConstraints?.length ?? 0;
    const pinCount = extractedData.pinouts?.length ?? 0;
    const specCount = extractedData.electricalSpecs?.length ?? 0;
    const configCount = extractedData.configurations?.length ?? 0;

    if (regCount > 0) {
      parts.push(`${regCount} register maps`);
    }
    if (timingCount > 0) {
      parts.push(`${timingCount} timing constraints`);
    }
    if (pinCount > 0) {
      parts.push(`${pinCount} pin definitions`);
    }
    if (specCount > 0) {
      parts.push(`${specCount} electrical specifications`);
    }
    if (configCount > 0) {
      parts.push(`${configCount} configurations`);
    }

    if (parts.length === 0) {
      return "No hardware data extracted";
    }

    return `Contains ${parts.join(", ")}`;
  }
}
