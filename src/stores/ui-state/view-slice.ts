import type { StateCreator } from "zustand";

export interface ViewState {
  isGitViewActive: boolean;
  isSearchViewActive: boolean;
  isGitHubPRsViewActive: boolean;
  isHardwareDocsViewActive: boolean;
  isGitHubCopilotSettingsVisible: boolean;
}

export interface ViewActions {
  setIsSearchViewActive: (v: boolean) => void;
  setIsGitHubCopilotSettingsVisible: (v: boolean) => void;
  setActiveView: (view: "files" | "git" | "search" | "github-prs" | "hardware-docs") => void;
}

export type ViewSlice = ViewState & ViewActions;

export const createViewSlice: StateCreator<ViewSlice, [], [], ViewSlice> = (set) => ({
  // State
  isGitViewActive: false,
  isSearchViewActive: false,
  isGitHubPRsViewActive: false,
  isHardwareDocsViewActive: false,
  isGitHubCopilotSettingsVisible: false,

  // Actions
  setIsSearchViewActive: (v: boolean) => set({ isSearchViewActive: v }),
  setIsGitHubCopilotSettingsVisible: (v: boolean) => set({ isGitHubCopilotSettingsVisible: v }),
  setActiveView: (view: "files" | "git" | "search" | "github-prs" | "hardware-docs") => {
    set({
      isGitViewActive: view === "git",
      isSearchViewActive: view === "search",
      isGitHubPRsViewActive: view === "github-prs",
      isHardwareDocsViewActive: view === "hardware-docs",
    });
  },
});
