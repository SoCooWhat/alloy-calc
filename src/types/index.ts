export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'DONE' | 'CANCELLED';

export type CutRuleType = 'width' | 'width-sub' | 'height' | 'height-sub' | 'fixed' | 'formula';

export type FormulaType = 'square' | 'round' | 'plate' | 'bar';

export type CalcMethod = 'per_sash' | 'per_area' | 'perimeter' | 'per_corner' | 'fixed';

export interface SizeSpec {
  width: number;
  height: number;
  qty: number;
  wall_thickness?: number; // 墙厚 mm
}

export type CasingType = 'none' | 'single' | 'double'; // 无包套 / 单包套 / 双包套

// ==================== 基础数据（保持不变） ====================

export interface Material {
  id: string;
  name: string;
  category: string;
  model: string;
  unit: string;
  unit_price: number;
  density: number;
  standard_length: number;
  stock_qty: number;
  safe_stock: number;
  supplier: string;
  status: number;
  updated_at?: string;
}

export interface Accessory {
  id: string;
  name: string;
  category: string;
  model: string;
  unit: string;
  unit_price: number;
  stock_qty: number;
  status: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  company: string;
  address: string;
  remark: string;
  created_by?: string;
  created_at?: string;
}

// ==================== 型材系列（V2 核心） ====================

export interface Series {
  id: string;
  name: string;
  brand: string;
  system_name: string;
  product_type: string;
  description: string;
  status: number;
  usage_count: number;
  groups?: SeriesGroup[];
  accessories?: SeriesAccessory[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SeriesGroup {
  id: string;
  series_id: string;
  name: string;
  sort_order: number;
  parts: SeriesPart[];
  created_at?: string;
}

export interface SeriesPart {
  id: string;
  group_id: string;
  part_name: string;
  material_id: string;
  material?: Material;
  formula_type: FormulaType;
  cut_rule_type: CutRuleType;
  cut_rule_value: string;
  qty_per_unit: number;
  remark: string;
  sort_order: number;
  created_at?: string;
}

export interface SeriesAccessory {
  id: string;
  series_id: string;
  accessory_id: string;
  accessory?: Accessory;
  category: string;
  calc_method: CalcMethod;
  calc_multiplier: number;
  calc_desc: string;
  created_at?: string;
}

// ==================== 订单 ====================

export interface Order {
  id: string;
  order_no: string;
  customer_id: string;
  customer?: Customer;
  series_id: string;
  series?: Series;
  status: OrderStatus;
  product_type: string;
  size_specs: SizeSpec[];
  total_weight: number;
  total_material_cost: number;
  total_accessory_cost: number;
  total_cost: number;
  remark: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
  order_accessories?: OrderAccessory[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  material_id: string;
  material?: Material;
  part_name: string;
  group_name: string;
  cut_length: number;
  qty_per_unit: number;
  total_qty: number;
  bars_needed: number;
  remnant_per_bar: number;
  weight_per_piece: number;
  total_weight: number;
  material_cost: number;
  remark?: string;
}

export interface OrderAccessory {
  id: string;
  order_id: string;
  accessory_id: string;
  accessory?: Accessory;
  calc_method: CalcMethod;
  calc_desc: string;
  total_qty: number;
  unit_price: number;
  subtotal: number;
}

export interface UserProfile {
  id: string;
  real_name: string;
  phone: string;
  company: string;
  status: number;
  created_at: string;
}

// ==================== 计算结果 ====================

export interface CalcResult {
  crossSectionArea: number;
  weightPerPiece: number;
  materialCost: number;
}

export interface PurchaseCalcResult {
  segmentsPerBar: number;
  barsNeeded: number;
  remnantPerBar: number;
  purchaseQty: number;
}

export interface BarLayout {
  segments: { partName: string; length: number }[];
  remnant: number;
  utilizationRate: number;
}

export interface ProfileCalcResult {
  material_id: string;
  material_name: string;
  group_name: string;
  total_segments: number;
  cut_length: number;
  weight_per_piece: number;
  total_weight: number;
  material_cost: number;
  bars_needed: number;
  remnant_per_bar: number;
  purchase_qty: number;
}

export interface AccessoryCalcResult {
  accessory_id: string;
  accessory_name: string;
  total_qty: number;
  unit_price: number;
  subtotal: number;
  calc_method: CalcMethod;
  calc_desc: string;
}

export interface CostSummary {
  total_weight: number;
  total_material_cost: number;
  total_accessory_cost: number;
  total_cost: number;
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

export interface PurchaseList {
  materials: {
    material_id: string;
    material_name: string;
    purchase_qty: number;
    unit: string;
  }[];
}

export interface CuttingList {
  bars: {
    material_id: string;
    material_name: string;
    layouts: BarLayout[];
  }[];
}
