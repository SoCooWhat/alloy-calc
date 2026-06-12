import { createClient } from '@/lib/supabase/server';
import { calcWeight, parseModelParams } from './formulas';
import { calcCutLength } from './cutting';
import { calcPurchase } from './cost';
import { greedyNesting, calcNestingStats, remnantGreedyNesting, filterReusableRemnants } from './nesting';
import type {
  SizeSpec,
  FormulaType,
  CutRuleType,
  CalcMethod,
  CasingType,
  ProfileCalcResult,
  AccessoryCalcResult,
  CostSummary,
  PurchaseList,
  CuttingList,
} from '@/types';

export interface CalcRequest {
  seriesId: string;
  sizeSpecs: SizeSpec[];
  kerf?: number; // 锯缝宽度，默认4mm
  useRemnants?: boolean; // 是否使用余料
  saveRemnants?: boolean; // 是否将可复用余料存入数据库
  casingType?: CasingType; // 包套类型：无/单包套/双包套
}

export interface CalcResponse {
  profile_results: ProfileCalcResult[];
  accessory_results: AccessoryCalcResult[];
  cost_summary: CostSummary;
  purchase_list: PurchaseList;
  cutting_list: CuttingList;
  nesting_stats: {
    total_bars: number;
    average_utilization: number;
    total_remnant: number;
    remnant_over_500: number;
  };
}

/**
 * 一键算料主函数
 */
export async function runCalculation(req: CalcRequest): Promise<CalcResponse> {
  const supabase = await createClient();
  const kerf = req.kerf || 4;

  // 1. 从数据库加载系列及其配方（三级关联）
  const { data: series, error: seriesError } = await supabase
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
    .eq('id', req.seriesId)
    .single();

  if (seriesError || !series) {
    throw new Error('系列不存在');
  }

  // 1.5 如果启用余料，从数据库加载余料库存
  let remnantsByMaterial: Map<string, number[]> = new Map();
  if (req.useRemnants) {
    const allMaterialIds = series.groups
      ?.flatMap((g: { parts?: { material_id: string }[] }) =>
        (g.parts || []).map(p => p.material_id)
      ) || [];
    const materialIds = [...new Set(allMaterialIds)];

    if (materialIds.length > 0) {
      const { data: remnants } = await supabase
        .from('remnants')
        .select('material_id, remnant_length, quantity')
        .in('material_id', materialIds);

      if (remnants) {
        remnants.forEach((r: { material_id: string; remnant_length: number; quantity: number }) => {
          const existing = remnantsByMaterial.get(r.material_id) || [];
          // 每条余料按 quantity 展开
          for (let i = 0; i < (r.quantity || 1); i++) {
            existing.push(r.remnant_length);
          }
          remnantsByMaterial.set(r.material_id, existing);
        });
      }
    }
  }

  // 排序
  if (series.groups) {
    series.groups.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
    series.groups.forEach((g: { parts: { sort_order: number }[] }) => {
      if (g.parts) g.parts.sort((a, b) => a.sort_order - b.sort_order);
    });
  }

  // 2. 计算型材用量（遍历 groups → parts）
  const profileMap = new Map<string, {
    material_id: string;
    material_name: string;
    group_name: string;
    cut_length: number;
    total_segments: number;
    formula_type: FormulaType;
    density: number;
    unit_price: number;
    standard_length: number;
    stock_qty: number;
  }>();

  if (series.groups) {
    req.sizeSpecs.forEach(spec => {
      series.groups.forEach((group: {
        name: string;
        parts: {
          material_id: string;
          cut_rule_type: string;
          cut_rule_value: string;
          formula_type: string;
          qty_per_unit: number;
          material: {
            name: string;
            model: string;
            density: number;
            unit_price: number;
            standard_length: number;
            stock_qty: number;
          } | null;
        }[];
      }) => {
        if (!group.parts) return;

        group.parts.forEach((part) => {
          const key = `${part.material_id}_${part.cut_rule_type}_${part.cut_rule_value}`;

          const cutLength = calcCutLength(
            {
              type: part.cut_rule_type as CutRuleType,
              value: part.cut_rule_value ? parseFloat(part.cut_rule_value) : undefined,
              formula: part.cut_rule_type === 'formula' ? part.cut_rule_value : undefined,
            },
            spec.width,
            spec.height,
            spec.wall_thickness,
            req.casingType
          );

          const totalSegments = spec.qty * (part.qty_per_unit || 1);

          if (profileMap.has(key)) {
            const existing = profileMap.get(key)!;
            existing.total_segments += totalSegments;
          } else {
            profileMap.set(key, {
              material_id: part.material_id,
              material_name: part.material ? `${part.material.name} - ${part.material.model}` : '未知',
              group_name: group.name,
              cut_length: cutLength,
              total_segments: totalSegments,
              formula_type: part.formula_type as FormulaType,
              density: part.material?.density || 2.70,
              unit_price: part.material?.unit_price || 0,
              standard_length: part.material?.standard_length || 6000,
              stock_qty: part.material?.stock_qty || 0,
            });
          }
        });
      });
    });
  }

  // 3. 计算每个型材的重量和成本
  const profileResults: ProfileCalcResult[] = [];

  profileMap.forEach((data) => {
    // 找到对应的 material 参数
    let modelParams = { outer: 0, wall: 0 };
    if (series.groups) {
      for (const group of series.groups) {
        const part = group.parts?.find(
          (p: { material_id: string }) => p.material_id === data.material_id
        );
        if (part?.material) {
          modelParams = parseModelParams(part.material.model, data.formula_type);
          break;
        }
      }
    }

    let weightPerPiece = 0;
    if (modelParams.outer > 0) {
      const calcResult = calcWeight({
        formulaType: data.formula_type,
        outer: modelParams.outer,
        wall: modelParams.wall,
        length: data.cut_length,
        density: data.density,
        unitPrice: data.unit_price,
      });
      weightPerPiece = calcResult.weightPerPiece;
    }

    const purchaseResult = calcPurchase({
      cutLength: data.cut_length,
      totalSegments: data.total_segments,
      barLength: data.standard_length,
      kerf,
      stockQty: data.stock_qty,
    });

    const totalWeight = Math.round(weightPerPiece * data.total_segments * 10000) / 10000;
    const materialCost = Math.round(totalWeight * data.unit_price * 100) / 100;

    profileResults.push({
      material_id: data.material_id,
      material_name: data.material_name,
      group_name: data.group_name,
      total_segments: data.total_segments,
      cut_length: Math.round(data.cut_length * 100) / 100,
      weight_per_piece: weightPerPiece,
      total_weight: totalWeight,
      material_cost: materialCost,
      bars_needed: purchaseResult.barsNeeded,
      remnant_per_bar: purchaseResult.remnantPerBar,
      purchase_qty: purchaseResult.purchaseQty,
    });
  });

  // 4. 计算配件用量（结构化规则）
  const accessoryResults: AccessoryCalcResult[] = [];
  const totalQty = req.sizeSpecs.reduce((sum, spec) => sum + spec.qty, 0);

  // 取第一个规格的宽高用于面积/周长计算（多规格时取第一个，后续可优化为加权平均）
  const firstSpec = req.sizeSpecs[0];
  const area = firstSpec ? (firstSpec.width * firstSpec.height / 1000000) : 0; // m²
  const perimeter = firstSpec ? ((firstSpec.width + firstSpec.height) * 2 / 1000) : 0; // m

  if (series.accessories) {
    series.accessories.forEach((acc: {
      accessory_id: string;
      calc_method: string;
      calc_multiplier: number;
      calc_desc: string;
      accessory: {
        name: string;
        model: string;
        unit_price: number;
      } | null;
    }) => {
      const accessory = acc.accessory;
      if (!accessory) return;

      const multiplier = acc.calc_multiplier || 1;
      let accessoryQty = 0;

      switch (acc.calc_method as CalcMethod) {
        case 'per_sash':
          // 每扇：总扇数 × 倍数
          accessoryQty = totalQty * multiplier;
          break;
        case 'per_area':
          // 按面积：面积(m²) × 总扇数 × 倍数
          accessoryQty = Math.ceil(area * totalQty * multiplier * 100) / 100;
          break;
        case 'perimeter':
          // 按周长：周长(m) × 总扇数 × 倍数
          accessoryQty = Math.ceil(perimeter * totalQty * multiplier * 100) / 100;
          break;
        case 'per_corner':
          // 每个角：总扇数 × 倍数
          accessoryQty = totalQty * multiplier;
          break;
        case 'fixed':
          // 固定数量
          accessoryQty = multiplier;
          break;
        default:
          accessoryQty = totalQty * multiplier;
      }

      const subtotal = Math.round(accessoryQty * accessory.unit_price * 100) / 100;

      accessoryResults.push({
        accessory_id: acc.accessory_id,
        accessory_name: `${accessory.name} - ${accessory.model}`,
        total_qty: accessoryQty,
        unit_price: accessory.unit_price,
        subtotal,
        calc_method: acc.calc_method as CalcMethod,
        calc_desc: acc.calc_desc || '',
      });
    });
  }

  // 5. 计算成本汇总
  const totalWeight = Math.round(
    profileResults.reduce((sum, p) => sum + p.total_weight, 0) * 10000
  ) / 10000;

  const totalMaterialCost = Math.round(
    profileResults.reduce((sum, p) => sum + p.material_cost, 0) * 100
  ) / 100;

  const totalAccessoryCost = Math.round(
    accessoryResults.reduce((sum, a) => sum + a.subtotal, 0) * 100
  ) / 100;

  const costSummary: CostSummary = {
    total_weight: totalWeight,
    total_material_cost: totalMaterialCost,
    total_accessory_cost: totalAccessoryCost,
    total_cost: Math.round((totalMaterialCost + totalAccessoryCost) * 100) / 100,
  };

  // 6. 生成采购清单
  const purchaseList: PurchaseList = {
    materials: profileResults.map(p => ({
      material_id: p.material_id,
      material_name: p.material_name,
      purchase_qty: p.purchase_qty,
      unit: '根',
    })),
  };

  // 7. 生成排料图
  const cuttingList: CuttingList = {
    bars: profileResults.map(p => {
      const segments = [{
        partName: p.material_name,
        length: p.cut_length,
        count: p.total_segments,
      }];

      let allLayouts;

      // 如果启用余料，先尝试用余料排料
      if (req.useRemnants) {
        const materialRemnants = remnantsByMaterial.get(p.material_id) || [];
        if (materialRemnants.length > 0) {
          const { remnantLayouts, remainingSegments } = remnantGreedyNesting(
            segments, materialRemnants, kerf
          );

          // 剩余段用整根料排
          const standardLayouts = remainingSegments.length > 0
            ? greedyNesting(remainingSegments, p.cut_length > 0 ? 6000 : 6000, kerf)
            : [];

          allLayouts = [...remnantLayouts, ...standardLayouts];
        } else {
          allLayouts = greedyNesting(segments, 6000, kerf);
        }
      } else {
        allLayouts = greedyNesting(segments, 6000, kerf);
      }

      return {
        material_id: p.material_id,
        material_name: p.material_name,
        layouts: allLayouts,
      };
    }),
  };

  // 8. 计算排料统计
  const allLayouts = cuttingList.bars.flatMap(b => b.layouts);
  const nestingStats = calcNestingStats(allLayouts);

  // 9. 如果 saveRemnants 为 true，将可复用余料（≥500mm）存入数据库
  if (req.saveRemnants) {
    const reusableRemnants: {
      material_id: string;
      remnant_length: number;
      quantity: number;
      source_order_id: null;
    }[] = [];

    for (const bar of cuttingList.bars) {
      const reusable = filterReusableRemnants(bar.layouts, 500);
      reusable.forEach(item => {
        reusableRemnants.push({
          material_id: bar.material_id,
          remnant_length: Math.round(item.remnant * 100) / 100,
          quantity: 1,
          source_order_id: null,
        });
      });
    }

    if (reusableRemnants.length > 0) {
      await supabase.from('remnants').insert(reusableRemnants);
    }
  }

  return {
    profile_results: profileResults,
    accessory_results: accessoryResults,
    cost_summary: costSummary,
    purchase_list: purchaseList,
    cutting_list: cuttingList,
    nesting_stats: {
      total_bars: nestingStats.totalBars,
      average_utilization: nestingStats.averageUtilization,
      total_remnant: nestingStats.totalRemnant,
      remnant_over_500: nestingStats.remnantOver500Count,
    },
  };
}

/**
 * 预览算料结果（不保存）
 */
export async function previewCalculation(req: CalcRequest): Promise<CalcResponse> {
  return runCalculation(req);
}
