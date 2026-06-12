-- 钛镁铝合金算料系统 - Supabase 数据库初始化脚本

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- 模板表
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  product_type VARCHAR(50),
  description TEXT,
  status SMALLINT DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 模板型材配方
CREATE TABLE template_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  part_name VARCHAR(100),
  material_id UUID REFERENCES materials(id),
  formula_type VARCHAR(50),
  cut_rule_type VARCHAR(50),
  cut_rule_value VARCHAR(200),
  qty_per_unit INTEGER DEFAULT 1,
  remark VARCHAR(200),
  sort_order INTEGER DEFAULT 0
);

-- 模板配件配方
CREATE TABLE template_accessories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  accessory_id UUID REFERENCES accessories(id),
  category VARCHAR(50),
  calc_rule VARCHAR(200),
  calc_desc VARCHAR(200)
);

-- 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no VARCHAR(32) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  template_id UUID REFERENCES templates(id),
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
  calc_rule VARCHAR(200),
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

-- 索引
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_template_parts_tpl ON template_parts(template_id);
CREATE INDEX idx_template_acc_tpl ON template_accessories(template_id);
