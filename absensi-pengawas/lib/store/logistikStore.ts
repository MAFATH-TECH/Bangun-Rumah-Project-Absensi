import { create } from 'zustand';

type LogistikState = {
  totalTransaksi: number;
  setTotalTransaksi: (totalTransaksi: number) => void;
};

export const useLogistikStore = create<LogistikState>((set) => ({
  totalTransaksi: 0,
  setTotalTransaksi: (totalTransaksi) => set({ totalTransaksi }),
}));
