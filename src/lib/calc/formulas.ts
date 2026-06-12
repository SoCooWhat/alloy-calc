import type { FormulaType } from '@/types';

export interface CalcInput {
  formulaType: FormulaType;
  outer: number;     // 方管边长 / 圆管外径 / 板材宽度 / 棒材直径
  wall: number;      // 壁厚（板材时为板材厚度）
  length: number;    // 切取长度 mm
  density: number;   // g/cm³
  unitPrice: number; // 元/kg
}

export interface CalcResult {
  crossSectionArea: number;  // mm²
  weightPerPiece: number;    // kg
  materialCost: number;      // 元
}

export function calcWeight(input: CalcInput): CalcResult {
  const { formulaType, outer, wall, length, density, unitPrice } = input;
  let area: number;

  switch (formulaType) {
    case 'square':
      // 方管截面积：外边长² - (外边长-2×壁厚)²
      area = outer * outer - (outer - 2 * wall) * (outer - 2 * wall);
      break;
    case 'round':
      // 圆管截面积：π/4 × (外径² - (外径-2×壁厚)²)
      area = Math.PI / 4 * (outer * outer - Math.pow(outer - 2 * wall, 2));
      break;
    case 'plate':
      // 板材截面积：宽度 × 厚度
      area = outer * wall;
      break;
    case 'bar':
      // 棒材截面积：π/4 × 直径²
      area = Math.PI / 4 * outer * outer;
      break;
    default:
      area = 0;
  }

  // 重量(kg) = 截面积(mm²) × 长度(mm) × 密度(g/cm³) / 10⁶
  // 注意：1 g/cm³ = 1000 kg/m³ = 0.001 g/mm³
  const weightPerPiece = area * length * density / 1e6;

  return {
    crossSectionArea: Math.round(area * 100) / 100,
    weightPerPiece: Math.round(weightPerPiece * 10000) / 10000,
    materialCost: Math.round(weightPerPiece * unitPrice * 100) / 100,
  };
}

/**
 * 根据型材参数计算重量（便捷方法）
 */
export function calcMaterialWeight(
  formulaType: FormulaType,
  modelParams: { outer: number; wall: number },
  length: number,
  density: number,
  unitPrice: number
): CalcResult {
  return calcWeight({
    formulaType,
    outer: modelParams.outer,
    wall: modelParams.wall,
    length,
    density,
    unitPrice,
  });
}

/**
 * 解析型材型号参数
 * 例如：50×50×2 → { outer: 50, wall: 2 }
 * 例如：D60×3 → { outer: 60, wall: 3 }
 */
export function parseModelParams(model: string, formulaType: FormulaType): { outer: number; wall: number } {
  const nums = model.match(/\d+/g)?.map(Number) || [0, 0];

  switch (formulaType) {
    case 'square':
      // 方管：边长×壁厚 或 边长×边长×壁厚
      return {
        outer: nums[0] || 0,
        wall: nums.length >= 3 ? nums[2] : nums[1] || 0,
      };
    case 'round':
      // 圆管：外径×壁厚
      return {
        outer: nums[0] || 0,
        wall: nums[1] || 0,
      };
    case 'plate':
      // 板材：宽度×厚度
      return {
        outer: nums[0] || 0,
        wall: nums[1] || 0,
      };
    case 'bar':
      // 棒材：直径
      return {
        outer: nums[0] || 0,
        wall: 0,
      };
    default:
      return { outer: nums[0] || 0, wall: nums[1] || 0 };
  }
}
