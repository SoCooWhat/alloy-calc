import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Accessory } from '@/types';

interface AccessoryStore {
  accessories: Accessory[];
  loading: boolean;
  error: string | null;
  fetchAccessories: () => Promise<void>;
  addAccessory: (data: Partial<Accessory>) => Promise<void>;
  updateAccessory: (id: string, data: Partial<Accessory>) => Promise<void>;
  deleteAccessory: (id: string) => Promise<void>;
}

const supabase = createClient();

export const useAccessoryStore = create<AccessoryStore>((set, get) => ({
  accessories: [],
  loading: false,
  error: null,

  fetchAccessories: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching accessories:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ accessories: data || [], loading: false });
  },

  addAccessory: async (data) => {
    const { error } = await supabase
      .from('accessories')
      .insert([data]);

    if (error) {
      console.error('Error adding accessory:', error);
      throw error;
    }

    get().fetchAccessories();
  },

  updateAccessory: async (id, data) => {
    const { error } = await supabase
      .from('accessories')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating accessory:', error);
      throw error;
    }

    get().fetchAccessories();
  },

  deleteAccessory: async (id) => {
    const { error } = await supabase
      .from('accessories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting accessory:', error);
      throw error;
    }

    get().fetchAccessories();
  },
}));
