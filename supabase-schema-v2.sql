-- 铝门窗智能算料系统 V2 - 数据库初始化脚本

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 基础表（保持不变） ====================

-- 用户扩展表
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  real_name VARCHAR(50),
  phone VARCHAR(20),
  company VARCHAR(200),
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 客户表
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(200),
  address VARCHAR(500),
  remark TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 型材表
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  model VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'kg',
  unit_price NUMERIC(10,2),
  density NUMERIC(8,4),
  standard_length NUMERIC(10,2) DEFAULT 6000,
  stock_qty INTEGER DEFAULT 0,
  safe_stock INTEGER DEFAULT 10,
  supplier VARCHAR(200),
  status SMALLINT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 配件表
CREATE TABLE accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  model VARCHAR(100),
  unit VARCHAR(20),
  unit_price NUMERIC(10,2),
  stock_qty INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT '在用',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 型材系列（新增，替代 templates） ====================

-- 型材系列主表
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  system_name VARCHAR(50) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  description TEXT,
  status SMALLINT DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 部件分组（窗框、窗扇、中梃等）
CREATE TABLE series_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 部件下的具体型材
CREATE TABLE series_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES series_groups(id) ON DELETE CASCADE,
  part_name VARCHAR(100) NOT NULL,
  material_id UUID REFERENCES materials(id),
  formula_type VARCHAR(50) NOT NULL,
  cut_rule_type VARCHAR(50) NOT NULL,
  cut_rule_value VARCHAR(200),
  qty_per_unit INTEGER DEFAULT 1,
  remark VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 系列配件方案（结构化规则）
CREATE TABLE series_accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  accessory_id UUID REFERENCES accessories(id),
  category VARCHAR(50) NOT NULL,
  calc_method VARCHAR(50) NOT NULL,
  calc_multiplier NUMERIC(10,2) DEFAULT 1,
  calc_desc VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 订单表（改为关联 series） ====================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(32) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  series_id UUID REFERENCES series(id),
  status VARCHAR(20) DEFAULT 'DRAFT',
  product_type VARCHAR(50),
  size_specs JSONB,
  total_weight NUMERIC(12,4),
  total_material_cost NUMERIC(12,2),
  total_accessory_cost NUMERIC(12,2),
  total_cost NUMERIC(12,2),
  remark TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单型材明细
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id),
  part_name VARCHAR(100),
  group_name VARCHAR(100),
  cut_length NUMERIC(10,2),
  qty_per_unit INTEGER,
  total_qty INTEGER,
  bars_needed INTEGER,
  remnant_per_bar NUMERIC(10,2),
  weight_per_piece NUMERIC(10,4),
  total_weight NUMERIC(10,4),
  material_cost NUMERIC(10,2),
  remark VARCHAR(500)
);

-- 订单配件明细
CREATE TABLE order_accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  accessory_id UUID REFERENCES accessories(id),
  calc_method VARCHAR(50),
  calc_desc VARCHAR(200),
  total_qty NUMERIC(10,2),
  unit_price NUMERIC(10,2),
  subtotal NUMERIC(10,2)
);

-- 余料记录
CREATE TABLE remnants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID REFERENCES materials(id),
  remnant_length NUMERIC(10,2),
  quantity INTEGER DEFAULT 1,
  source_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 索引 ====================

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_series ON orders(series_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_series_groups_series ON series_groups(series_id);
CREATE INDEX idx_series_parts_group ON series_parts(group_id);
CREATE INDEX idx_series_acc_series ON series_accessories(series_id);
