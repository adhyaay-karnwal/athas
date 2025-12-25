export type ViewerType = "3d-model" | "pcb" | "test-result" | "simulation";

export interface HardwareViewer {
  id: string;
  type: ViewerType;
  filePath: string;
  name: string;
}

export interface PCBViewerData {
  filePath: string;
  layers: string[];
  components: PCBComponent[];
  nets: PCBNet[];
  traces: PCBTrace[];
}

export interface PCBComponent {
  id: string;
  name: string;
  type: string;
  footprint: string;
  position: { x: number; y: number };
  rotation: number;
  value?: string;
  properties?: Record<string, string>;
}

export interface PCBNet {
  id: string;
  name: string;
  nodes: { componentId: string; pin: string }[];
}

export interface PCBTrace {
  netId: string;
  path: { x: number; y: number }[];
  layer: string;
  width: number;
}

export interface ThreeDModelData {
  filePath: string;
  vertices: Float32Array;
  normals?: Float32Array;
  uvs?: Float32Array;
  indices?: Uint16Array;
  materials?: Material[];
  bounds: { min: [number, number, number]; max: [number, number, number] };
}

export interface Material {
  name: string;
  color?: { r: number; g: number; b: number; a: number };
  metalness?: number;
  roughness?: number;
}

export interface TestResult {
  id: string;
  name: string;
  status: "pass" | "fail" | "skipped" | "running";
  duration: number;
  timestamp: Date;
  output?: string;
  metrics?: Record<string, number>;
}

export interface SimulationData {
  timestamp: number;
  signals: SignalData[];
  duration: number;
}

export interface SignalData {
  name: string;
  samples: number[];
  unit?: string;
  min?: number;
  max?: number;
}
