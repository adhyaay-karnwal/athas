import { create } from "zustand";
import { createWithEqualityFn } from "zustand/traditional";
import type {
  ExtractedData,
  HardwareDocument,
  HardwareDocsProject,
  DocumentType,
} from "../types/hardware-docs";

interface HardwareDocsState {
  projects: Map<string, HardwareDocsProject>;
  currentProjectId: string | null;
  selectedDocumentId: string | null;
  isDocumentViewerOpen: boolean;
  isProcessing: boolean;
  processingDocumentId: string | null;
  searchQuery: string;
  filterType: DocumentType | "all";
}

interface HardwareDocsActions {
  setCurrentProject: (projectId: string | null) => void;
  addProject: (project: HardwareDocsProject) => void;
  updateProject: (projectId: string, updates: Partial<HardwareDocsProject>) => void;
  removeProject: (projectId: string) => void;
  addDocument: (projectId: string, document: HardwareDocument) => void;
  updateDocument: (projectId: string, documentId: string, updates: Partial<HardwareDocument>) => void;
  removeDocument: (projectId: string, documentId: string) => void;
  setSelectedDocument: (documentId: string | null) => void;
  setDocumentViewerOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: DocumentType | "all") => void;
  setProcessing: (isProcessing: boolean, documentId: string | null) => void;
  updateExtractedData: (projectId: string, documentId: string, extractedData: ExtractedData) => void;
  getProjectDocuments: (projectId: string) => HardwareDocument[];
  getFilteredDocuments: (projectId: string) => HardwareDocument[];
  getDocumentById: (documentId: string) => HardwareDocument | undefined;
  getAllExtractedData: (projectId: string) => ExtractedData;
  clearStore: () => void;
}

const initialState: HardwareDocsState = {
  projects: new Map(),
  currentProjectId: null,
  selectedDocumentId: null,
  isDocumentViewerOpen: false,
  isProcessing: false,
  processingDocumentId: null,
  searchQuery: "",
  filterType: "all",
};

export const useHardwareDocsStore = createWithEqualityFn<HardwareDocsState & HardwareDocsActions>(
  (set, get) => ({
    ...initialState,

    setCurrentProject: (projectId: string | null) => {
      set({ currentProjectId: projectId });
    },

    addProject: (project: HardwareDocsProject) => {
      set((state) => {
        const newProjects = new Map(state.projects);
        newProjects.set(project.id, project);
        return { projects: newProjects };
      });
    },

    updateProject: (projectId: string, updates: Partial<HardwareDocsProject>) => {
      set((state) => {
        const newProjects = new Map(state.projects);
        const project = newProjects.get(projectId);
        if (project) {
          newProjects.set(projectId, { ...project, ...updates });
        }
        return { projects: newProjects };
      });
    },

    removeProject: (projectId: string) => {
      set((state) => {
        const newProjects = new Map(state.projects);
        newProjects.delete(projectId);
        return { projects: newProjects };
      });
    },

    addDocument: (projectId: string, document: HardwareDocument) => {
      set((state) => {
        const newProjects = new Map(state.projects);
        const project = newProjects.get(projectId);
        if (project) {
          const updatedProject = {
            ...project,
            documents: [...project.documents, document],
            lastModified: new Date(),
          };
          newProjects.set(projectId, updatedProject);
        }
        return { projects: newProjects };
      });
    },

    updateDocument: (projectId: string, documentId: string, updates: Partial<HardwareDocument>) => {
      set((state) => {
        const newProjects = new Map(state.projects);
        const project = newProjects.get(projectId);
        if (project) {
          const updatedDocuments = project.documents.map((doc) =>
            doc.id === documentId ? { ...doc, ...updates } : doc
          );
          newProjects.set(projectId, {
            ...project,
            documents: updatedDocuments,
            lastModified: new Date(),
          });
        }
        return { projects: newProjects };
      });
    },

    removeDocument: (projectId: string, documentId: string) => {
      set((state) => {
        const newProjects = new Map(state.projects);
        const project = newProjects.get(projectId);
        if (project) {
          const updatedDocuments = project.documents.filter((doc) => doc.id !== documentId);
          newProjects.set(projectId, {
            ...project,
            documents: updatedDocuments,
            lastModified: new Date(),
          });
        }
        return { projects: newProjects };
      });
    },

    setSelectedDocument: (documentId: string | null) => {
      set({ selectedDocumentId: documentId });
    },

    setDocumentViewerOpen: (isOpen: boolean) => {
      set({ isDocumentViewerOpen: isOpen });
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    setFilterType: (type: DocumentType | "all") => {
      set({ filterType: type });
    },

    setProcessing: (isProcessing: boolean, documentId: string | null) => {
      set({ isProcessing, processingDocumentId: documentId });
    },

    updateExtractedData: (projectId: string, documentId: string, extractedData: ExtractedData) => {
      set((state) => {
        const newProjects = new Map(state.projects);
        const project = newProjects.get(projectId);
        if (project) {
          const updatedDocuments = project.documents.map((doc) =>
            doc.id === documentId ? { ...doc, extractedData, lastAccessed: new Date() } : doc
          );
          newProjects.set(projectId, {
            ...project,
            documents: updatedDocuments,
            lastModified: new Date(),
          });
        }
        return { projects: newProjects };
      });
    },

    getProjectDocuments: (projectId: string) => {
      const project = get().projects.get(projectId);
      return project?.documents ?? [];
    },

    getFilteredDocuments: (projectId: string) => {
      const state = get();
      const documents = state.getProjectDocuments(projectId);
      const { searchQuery, filterType } = state;

      return documents.filter((doc) => {
        const matchesType = filterType === "all" || doc.type === filterType;
        const matchesSearch =
          searchQuery === "" ||
          doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.metadata.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (doc.metadata.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          (doc.metadata.partNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

        return matchesType && matchesSearch;
      });
    },

    getDocumentById: (documentId: string) => {
      const state = get();
      for (const project of state.projects.values()) {
        const document = project.documents.find((doc) => doc.id === documentId);
        if (document) return document;
      }
      return undefined;
    },

    getAllExtractedData: (projectId: string) => {
      const documents = get().getProjectDocuments(projectId);
      const aggregatedData: ExtractedData = {
        registerMaps: [],
        timingConstraints: [],
        pinouts: [],
        electricalSpecs: [],
        configurations: [],
      };

      for (const doc of documents) {
        if (doc.extractedData) {
          if (doc.extractedData.registerMaps) {
            aggregatedData.registerMaps?.push(...doc.extractedData.registerMaps);
          }
          if (doc.extractedData.timingConstraints) {
            aggregatedData.timingConstraints?.push(...doc.extractedData.timingConstraints);
          }
          if (doc.extractedData.pinouts) {
            aggregatedData.pinouts?.push(...doc.extractedData.pinouts);
          }
          if (doc.extractedData.electricalSpecs) {
            aggregatedData.electricalSpecs?.push(...doc.extractedData.electricalSpecs);
          }
          if (doc.extractedData.configurations) {
            aggregatedData.configurations?.push(...doc.extractedData.configurations);
          }
        }
      }

      return aggregatedData;
    },

    clearStore: () => {
      set(initialState);
    },
  }),
  Object.is,
);
