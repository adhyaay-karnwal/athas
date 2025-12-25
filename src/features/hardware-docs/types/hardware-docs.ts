export type DocumentType = "datasheet" | "reference-manual" | "schematic" | "company-knowledge" | "other";

export interface HardwareDocument {
  id: string;
  projectId: string;
  name: string;
  type: DocumentType;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
  lastAccessed: Date;
  metadata: DocumentMetadata;
  extractedData?: ExtractedData;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  version?: string;
  revision?: string;
  pages?: number;
  manufacturer?: string;
  partNumber?: string;
  description?: string;
  tags: string[];
}

export interface ExtractedData {
  registerMaps?: RegisterMap[];
  timingConstraints?: TimingConstraint[];
  pinouts?: Pinout[];
  electricalSpecs?: ElectricalSpec[];
  configurations?: Configuration[];
  summary?: string;
}

export interface RegisterMap {
  name: string;
  address: string;
  description: string;
  bitWidth: number;
  access: "read" | "write" | "read-write" | "read-only" | "write-only";
  fields?: RegisterField[];
  resetValue?: string;
}

export interface RegisterField {
  name: string;
  bitRange: [number, number];
  description: string;
  enumValues?: EnumValue[];
}

export interface EnumValue {
  value: string;
  description: string;
}

export interface TimingConstraint {
  name: string;
  parameter: string;
  min?: number;
  typ?: number;
  max?: number;
  unit: string;
  condition?: string;
}

export interface Pinout {
  pinNumber: string;
  name: string;
  type: "input" | "output" | "bidirectional" | "power" | "ground";
  description?: string;
  function?: string;
}

export interface ElectricalSpec {
  parameter: string;
  min?: number;
  typ?: number;
  max?: number;
  unit: string;
  condition?: string;
}

export interface Configuration {
  name: string;
  description: string;
  settings: Record<string, string | number | boolean>;
}

export interface HardwareDocsProject {
  id: string;
  name: string;
  rootFolderPath: string;
  documents: HardwareDocument[];
  createdAt: Date;
  lastModified: Date;
}
