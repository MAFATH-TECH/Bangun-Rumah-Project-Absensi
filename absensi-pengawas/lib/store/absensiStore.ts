import { create } from 'zustand';

type AbsensiState = {
  checkedIn: boolean;
  setCheckedIn: (checkedIn: boolean) => void;
};

export const useAbsensiStore = create<AbsensiState>((set) => ({
  checkedIn: false,
  setCheckedIn: (checkedIn) => set({ checkedIn }),
}));
