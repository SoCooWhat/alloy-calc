import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Series, SeriesGroup, SeriesPart, SeriesAccessory } from '@/types';

interface SeriesStore {
  seriesList: Series[];
  currentSeries: Series | null;
  loading: boolean;
  error: string | null;
  fetchSeriesList: () => Promise<void>;
  fetchSeries: (id: string) => Promise<void>;
  saveSeriesWithDetails: (
    series: Partial<Series>,
    groups: Partial<SeriesGroup>[],
    accessories: Partial<SeriesAccessory>[],
    isEdit: boolean
  ) => Promise<void>;
  deleteSeries: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;
}

const supabase = createClient();

export const useSeriesStore = create<SeriesStore>((set, get) => ({
  seriesList: [],
  currentSeries: null,
  loading: false,
  error: null,

  fetchSeriesList: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching series:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ seriesList: data || [], loading: false });
  },

  fetchSeries: async (id: string) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('series')
      .select(`
        *,
        groups:series_groups(
          *,
          parts:series_parts(
            *,
            material:materials(*)
          )
        ),
        accessories:series_accessories(
          *,
          accessory:accessories(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching series:', error);
      set({ loading: false, error: error.message });
      return;
    }

    // 按 sort_order 排序
    if (data?.groups) {
      data.groups.sort((a: SeriesGroup, b: SeriesGroup) => a.sort_order - b.sort_order);
      data.groups.forEach((g: SeriesGroup) => {
        if (g.parts) {
          g.parts.sort((a: SeriesPart, b: SeriesPart) => a.sort_order - b.sort_order);
        }
      });
    }

    set({ currentSeries: data, loading: false });
  },

  saveSeriesWithDetails: async (series, groups, accessories, isEdit) => {
    set({ loading: true, error: null });

    try {
      let seriesId: string;

      if (isEdit && series.id) {
        // 更新现有系列
        const { error: updateError } = await supabase
          .from('series')
          .update({
            name: series.name,
            brand: series.brand,
            system_name: series.system_name,
            product_type: series.product_type,
            description: series.description,
            status: series.status,
          })
          .eq('id', series.id);

        if (updateError) throw updateError;
        seriesId = series.id;

        // 删除旧的 groups（CASCADE 会自动删除 parts）
        await supabase.from('series_groups').delete().eq('series_id', seriesId);
        // 删除旧的 accessories
        await supabase.from('series_accessories').delete().eq('series_id', seriesId);
      } else {
        // 创建新系列
        const { data: newSeries, error: createError } = await supabase
          .from('series')
          .insert([{
            name: series.name,
            brand: series.brand,
            system_name: series.system_name,
            product_type: series.product_type,
            description: series.description || '',
            status: 1,
          }])
          .select()
          .single();

        if (createError) throw createError;
        seriesId = newSeries.id;
      }

      // 插入分组和部件
      for (let gi = 0; gi < groups.length; gi++) {
        const group = groups[gi];
        const { data: newGroup, error: groupError } = await supabase
          .from('series_groups')
          .insert([{
            series_id: seriesId,
            name: group.name || '未命名分组',
            sort_order: gi,
          }])
          .select()
          .single();

        if (groupError) throw groupError;

        // 插入该分组下的部件
        if (group.parts && group.parts.length > 0) {
          const partsData = group.parts.map((part, pi) => ({
            group_id: newGroup.id,
            part_name: part.part_name || '',
            material_id: part.material_id || null,
            formula_type: part.formula_type || 'square',
            cut_rule_type: part.cut_rule_type || 'width',
            cut_rule_value: part.cut_rule_value || '',
            qty_per_unit: part.qty_per_unit || 1,
            remark: part.remark || '',
            sort_order: pi,
          }));

          const { error: partsError } = await supabase
            .from('series_parts')
            .insert(partsData);

          if (partsError) throw partsError;
        }
      }

      // 插入配件
      if (accessories.length > 0) {
        const accessoriesData = accessories.map((acc) => ({
          series_id: seriesId,
          accessory_id: acc.accessory_id || null,
          category: acc.category || '',
          calc_method: acc.calc_method || 'per_sash',
          calc_multiplier: acc.calc_multiplier || 1,
          calc_desc: acc.calc_desc || '',
        }));

        const { error: accError } = await supabase
          .from('series_accessories')
          .insert(accessoriesData);

        if (accError) throw accError;
      }

      set({ loading: false });
      get().fetchSeriesList();
    } catch (error: unknown) {
      const err = error as Error;
      const msg = err.message || JSON.stringify(error);
      console.error('Error saving series with details:', error);
      set({ loading: false, error: msg });
      throw error;
    }
  },

  deleteSeries: async (id) => {
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting series:', error);
      throw error;
    }

    get().fetchSeriesList();
  },

  incrementUsage: async (id) => {
    // 先获取当前 usage_count
    const { data } = await supabase
      .from('series')
      .select('usage_count')
      .eq('id', id)
      .single();

    if (data) {
      await supabase
        .from('series')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', id);
    }
  },
}));
