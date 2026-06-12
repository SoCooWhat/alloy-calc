import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Material } from '@/types';

interface MaterialStore {
  materials: Material[];
  loading: boolean;
  error: string | null;
  fetchMaterials: () => Promise<void>;
  addMaterial: (data: Partial<Material>) => Promise<void>;
  updateMaterial: (id: string, data: Partial<Material>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
}

const supabase = createClient();

export const useMaterialStore = create<MaterialStore>((set, get) => ({
  materials: [],
  loading: false,
  error: null,

  fetchMaterials: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching materials:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ materials: data || [], loading: false });
  },

  addMaterial: async (data) => {
    const { error } = await supabase
      .from('materials')
      .insert([data]);

    if (error) {
      console.error('Error adding material:', error);
      throw error;
    }

    get().fetchMaterials();
  },

  updateMaterial: async (id, data) => {
    const { error } = await supabase
      .from('materials')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating material:', error);
      throw error;
    }

    get().fetchMaterials();
  },

  deleteMaterial: async (id) => {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting material:', error);
      throw error;
    }

    get().fetchMaterials();
  },
}));
