import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  calendarMonth: Date;
  setSidebarOpen: (open: boolean) => void;
  setCalendarMonth: (date: Date) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  calendarMonth: new Date(),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCalendarMonth: (calendarMonth) => set({ calendarMonth }),
}));
