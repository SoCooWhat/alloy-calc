import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderStatus, ProfileCalcResult, AccessoryCalcResult } from '@/types';

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    search: string;
  };
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (data: Partial<Order>) => Promise<string>;
  createOrderWithItems: (orderData: Partial<Order>, items: ProfileCalcResult[], accessories: AccessoryCalcResult[]) => Promise<string>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  setFilters: (filters: { status?: string; search?: string }) => void;
}

const supabase = createClient();

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  filters: {
    status: '',
    search: '',
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    const { filters } = get();

    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, name, company),
        series:series(id, name, product_type)
      `)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(
        `order_no.ilike.%${filters.search}%,customer.name.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ orders: data || [], loading: false });
  },

  fetchOrder: async (id: string) => {
    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, name, company, phone, address),
        series:series(id, name, brand, system_name, product_type),
        items:order_items(
          *,
          material:materials(id, name, model)
        ),
        order_accessories(
          *,
          accessory:accessories(id, name, model)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ currentOrder: data, loading: false });
  },

  createOrder: async (data) => {
    set({ loading: true, error: null });

    const { data: order, error } = await supabase
      .from('orders')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      set({ loading: false, error: error.message });
      throw error;
    }

    set({ loading: false });
    get().fetchOrders();
    return order.id;
  },

  createOrderWithItems: async (orderData, items, accessories) => {
    set({ loading: true, error: null });

    try {
      // 1. 创建订单主表
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. 保存型材明细
      if (items && items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(items.map(item => ({
            order_id: order.id,
            material_id: item.material_id || null,
            part_name: item.part_name || item.material_name,
            group_name: item.group_name || '',
            cut_length: item.cut_length,
            qty_per_unit: 1,
            total_qty: item.total_segments,
            bars_needed: item.bars_needed,
            remnant_per_bar: item.remnant_per_bar,
            weight_per_piece: item.weight_per_piece,
            total_weight: item.total_weight,
            material_cost: item.material_cost,
          })));

        if (itemsError) throw itemsError;
      }

      // 3. 保存配件明细
      if (accessories && accessories.length > 0) {
        const { error: accError } = await supabase
          .from('order_accessories')
          .insert(accessories.map(acc => ({
            order_id: order.id,
            accessory_id: acc.accessory_id || null,
            calc_method: acc.calc_method || '',
            calc_desc: acc.calc_desc || '',
            total_qty: acc.total_qty,
            unit_price: acc.unit_price,
            subtotal: acc.subtotal,
          })));

        if (accError) throw accError;
      }

      set({ loading: false });
      get().fetchOrders();
      return order.id;
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creating order with items:', error);
      set({ loading: false, error: err.message });
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null });

    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating order status:', error);
      set({ loading: false, error: error.message });
      throw error;
    }

    set({ loading: false });
    get().fetchOrders();
    if (get().currentOrder?.id === id) {
      get().fetchOrder(id);
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    get().fetchOrders();
  },
}));
