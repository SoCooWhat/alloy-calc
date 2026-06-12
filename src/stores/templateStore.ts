import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Template, TemplatePart, TemplateAccessory } from '@/types';

interface TemplateStore {
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  createTemplate: (data: Partial<Template>) => Promise<string>;
  updateTemplate: (id: string, data: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  saveTemplateWithDetails: (
    template: Partial<Template>,
    parts: Partial<TemplatePart>[],
    accessories: Partial<TemplateAccessory>[],
    isEdit: boolean
  ) => Promise<void>;
}

const supabase = createClient();

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ templates: data || [], loading: false });
  },

  fetchTemplate: async (id: string) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('templates')
      .select(`
        *,
        parts:template_parts(*),
        accessories:template_accessories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      set({ loading: false, error: error.message });
      return;
    }

    set({ currentTemplate: data, loading: false });
  },

  createTemplate: async (data) => {
    const { data: result, error } = await supabase
      .from('templates')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      throw error;
    }

    get().fetchTemplates();
    return result.id;
  },

  updateTemplate: async (id, data) => {
    const { error } = await supabase
      .from('templates')
      .update(data)
      .eq('id', id);

    if (error) {
      console.error('Error updating template:', error);
      throw error;
    }

    get().fetchTemplates();
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      throw error;
    }

    get().fetchTemplates();
  },

  saveTemplateWithDetails: async (template, parts, accessories, isEdit) => {
    set({ loading: true, error: null });

    try {
      let templateId: string;

      if (isEdit && template.id) {
        // Update existing template
        const { error: updateError } = await supabase
          .from('templates')
          .update({
            name: template.name,
            product_type: template.product_type,
            description: template.description,
            status: template.status,
          })
          .eq('id', template.id);

        if (updateError) throw updateError;
        templateId = template.id;

        // Delete existing parts and accessories
        await supabase.from('template_parts').delete().eq('template_id', templateId);
        await supabase.from('template_accessories').delete().eq('template_id', templateId);
      } else {
        // Create new template
        const { data: newTemplate, error: createError } = await supabase
          .from('templates')
          .insert([{
            name: template.name,
            product_type: template.product_type,
            description: template.description,
            status: 1,
          }])
          .select()
          .single();

        if (createError) throw createError;
        templateId = newTemplate.id;
      }

      // Insert parts
      if (parts.length > 0) {
        const partsData = parts.map((part, index) => ({
          template_id: templateId,
          part_name: part.part_name,
          material_id: part.material_id,
          formula_type: part.formula_type,
          cut_rule_type: part.cut_rule_type,
          cut_rule_value: part.cut_rule_value,
          qty_per_unit: part.qty_per_unit || 1,
          remark: part.remark || '',
          sort_order: index,
        }));

        const { error: partsError } = await supabase
          .from('template_parts')
          .insert(partsData);

        if (partsError) throw partsError;
      }

      // Insert accessories
      if (accessories.length > 0) {
        const accessoriesData = accessories.map((acc) => ({
          template_id: templateId,
          accessory_id: acc.accessory_id,
          category: acc.category,
          calc_rule: acc.calc_rule,
          calc_desc: acc.calc_desc,
        }));

        const { error: accError } = await supabase
          .from('template_accessories')
          .insert(accessoriesData);

        if (accError) throw accError;
      }

      set({ loading: false });
      get().fetchTemplates();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error saving template with details:', error);
      set({ loading: false, error: err.message });
      throw error;
    }
  },
}));
