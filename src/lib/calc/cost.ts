export interface PurchaseCalcInput {
  cutLength: number;       // 切段长度 mm
  totalSegments: number;   // 总需段数
  barLength: number;       // 标准料长 mm（默认 6000）
  kerf: number;            // 锯缝宽度 mm（默认 4）
  stockQty: number;        // 当前库存（根）
}

export interface PurchaseCalcResult {
  segmentsPerBar: number;  // 每根可切段数
  barsNeeded: number;      // 需用根数
  remnantPerBar: number;   // 每根余料 mm
  purchaseQty: number;     // 需采购数量
  totalRemnant: number;    // 总余料 mm
}

/**
 * 计算采购量
 * 考虑锯缝损耗和库存情况
 */
export function calcPurchase(input: PurchaseCalcInput): PurchaseCalcResult {
  const {
    cutLength,
    totalSegments,
    barLength = 6000,
    kerf = 4,
    stockQty = 0,
  } = input;

  // 每根料可切段数
  // 公式：floor((标准料长 + 锯缝) / (切段长度 + 锯缝))
  const segmentsPerBar = Math.floor((barLength + kerf) / (cutLength + kerf));

  // 需用根数
  const barsNeeded = Math.ceil(totalSegments / segmentsPerBar);

  // 每根余料
  // 公式：标准料长 - 每根可切段数 × (切段长度 + 锯缝) + 锯缝
  const remnantPerBar = barLength - segmentsPerBar * (cutLength + kerf) + kerf;

  // 需采购数量（考虑库存）
  const purchaseQty = Math.max(0, barsNeeded - stockQty);

  // 总余料
  const totalRemnant = barsNeeded * remnantPerBar;

  return {
    segmentsPerBar,
    barsNeeded,
    remnantPerBar: Math.round(remnantPerBar * 100) / 100,
    purchaseQty,
    totalRemnant: Math.round(totalRemnant * 100) / 100,
  };
}

/**
 * 批量计算采购需求
 */
export interface MaterialPurchaseNeed {
  materialId: string;
  materialName: string;
  cutLength: number;
  totalSegments: number;
  unit: string;
  stockQty: number;
}

export interface MaterialPurchaseResult extends MaterialPurchaseNeed {
  segmentsPerBar: number;
  barsNeeded: number;
  remnantPerBar: number;
  purchaseQty: number;
  totalRemnant: number;
}

export function calcBatchPurchase(
  needs: MaterialPurchaseNeed[],
  barLength: number = 6000,
  kerf: number = 4
): MaterialPurchaseResult[] {
  return needs.map(need => {
    const result = calcPurchase({
      cutLength: need.cutLength,
      totalSegments: need.totalSegments,
      barLength,
      kerf,
      stockQty: need.stockQty,
    });

    return {
      ...need,
      ...result,
    };
  });
}

/**
 * 计算材料利用率
 */
export function calcUtilizationRate(
  totalCutLength: number,
  totalBarLength: number
): number {
  if (totalBarLength === 0) return 0;
  return Math.round((totalCutLength / totalBarLength) * 10000) / 100;
}

/**
 * 格式化长度显示
 */
export function formatLength(lengthMm: number): string {
  if (lengthMm >= 1000) {
    return `${(lengthMm / 1000).toFixed(2)}m`;
  }
  return `${lengthMm}mm`;
}

/**
 * 格式化重量显示
 */
export function formatWeight(weightKg: number): string {
  if (weightKg >= 1) {
    return `${weightKg.toFixed(2)}kg`;
  }
  return `${(weightKg * 1000).toFixed(0)}g`;
}
