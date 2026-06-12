import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Customer } from '@/types';

interface CustomerStore {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (data: Partial<Customer>) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

const supabase = createClient();

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching customers:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ customers: data || [], loading: false });
  },

  addCustomer: async (data) => {
    const { error } = await supabase
      .from('customers')
      .insert([data]);

    if (error) {
      console.error('Error adding customer:', error);
      throw error;
    }

    get().fetchCustomers();
  },

  updateCustomer: async (id, data) => {
    const { error } = await supabase
      .from('customers')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    get().fetchCustomers();
  },

  deleteCustomer: async (id) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }

    get().fetchCustomers();
  },
}));
