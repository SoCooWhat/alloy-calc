import { create } from 'zustand';
import type { CalcResponse } from '@/lib/calc';
import type { CasingType } from '@/types';

interface CalcStore {
  // 状态
  result: CalcResponse | null;
  loading: boolean;
  error: string | null;
  lastRequest: {
    seriesId: string;
    sizeSpecs: { width: number; height: number; qty: number; wall_thickness?: number }[];
  } | null;

  // 操作
  setCalcResult: (result: CalcResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastRequest: (request: { seriesId: string; sizeSpecs: { width: number; height: number; qty: number; wall_thickness?: number }[] }) => void;
  clearResult: () => void;

  // 异步操作
  calculate: (
    seriesId: string,
    sizeSpecs: { width: number; height: number; qty: number; wall_thickness?: number }[],
    useRemnants?: boolean,
    casingType?: CasingType
  ) => Promise<void>;
}

export const useCalcStore = create<CalcStore>((set, get) => ({
  // 初始状态
  result: null,
  loading: false,
  error: null,
  lastRequest: null,

  // 同步操作
  setCalcResult: (result) => set({ result }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setLastRequest: (request) => set({ lastRequest: request }),
  clearResult: () => set({ result: null, error: null }),

  // 异步操作
  calculate: async (seriesId, sizeSpecs, useRemnants?: boolean, casingType?: CasingType) => {
    set({ loading: true, error: null, lastRequest: { seriesId, sizeSpecs } });

    try {
      const response = await fetch('/api/calc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seriesId,
          sizeSpecs,
          useRemnants: useRemnants ?? false,
          saveRemnants: true,
          casingType: casingType || 'none',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '计算失败');
      }

      set({
        result: data.data,
        loading: false,
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('算料错误:', error);
      set({
        error: err.message || '计算失败，请重试',
        loading: false,
      });
    }
  },
}));
