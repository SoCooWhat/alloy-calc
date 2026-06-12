import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

interface Remnant {
  id: string;
  material_id: string;
  material_name?: string;
  material_model?: string;
  remnant_length: number;
  quantity: number;
  source_order_id: string | null;
  created_at: string;
}

interface RemnantStore {
  remnants: Remnant[];
  loading: boolean;
  error: string | null;
  fetchRemnants: (materialId?: string) => Promise<void>;
  addRemnant: (data: Partial<Remnant>) => Promise<void>;
  deleteRemnant: (id: string) => Promise<void>;
  matchRemnants: (materialId: string, neededLength: number) => Remnant[];
}

const supabase = createClient();

export const useRemnantStore = create<RemnantStore>((set, get) => ({
  remnants: [],
  loading: false,
  error: null,

  fetchRemnants: async (materialId?: string) => {
    set({ loading: true, error: null });

    let query = supabase
      .from('remnants')
      .select(`
        *,
        material:materials(id, name, model)
      `)
      .order('created_at', { ascending: false });

    if (materialId) {
      query = query.eq('material_id', materialId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching remnants:', error);
      set({ loading: false, error: error.message });
      return;
    }

    const formattedData = data?.map((item: {
      id: string;
      material_id: string;
      material: { name: string; model: string } | null;
      remnant_length: number;
      quantity: number;
      source_order_id: string | null;
      created_at: string;
    }) => ({
      id: item.id,
      material_id: item.material_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      material_name: (item.material as any)?.name || '-',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      material_model: (item.material as any)?.model || '-',
      remnant_length: item.remnant_length,
      quantity: item.quantity,
      source_order_id: item.source_order_id,
      created_at: item.created_at,
    })) || [];

    set({ remnants: formattedData, loading: false });
  },

  addRemnant: async (data) => {
    const { error } = await supabase
      .from('remnants')
      .insert([data]);

    if (error) {
      console.error('Error adding remnant:', error);
      throw error;
    }

    get().fetchRemnants();
  },

  deleteRemnant: async (id) => {
    const { error } = await supabase
      .from('remnants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting remnant:', error);
      throw error;
    }

    get().fetchRemnants();
  },

  matchRemnants: (materialId, neededLength) => {
    const { remnants } = get();
    return remnants.filter(
      r => r.material_id === materialId && r.remnant_length >= neededLength
    );
  },
}));
