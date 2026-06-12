-- 为所有表开启 RLS 并添加允许策略
-- 执行顺序：先 supabase-schema-v2.sql，再 supabase-seed-v2.sql，最后执行这个

-- ==================== materials ====================
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on materials" ON materials FOR ALL USING (true) WITH CHECK (true);

-- ==================== accessories ====================
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on accessories" ON accessories FOR ALL USING (true) WITH CHECK (true);

-- ==================== customers ====================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- ==================== series ====================
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on series" ON series FOR ALL USING (true) WITH CHECK (true);

-- ==================== series_groups ====================
ALTER TABLE series_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on series_groups" ON series_groups FOR ALL USING (true) WITH CHECK (true);

-- ==================== series_parts ====================
ALTER TABLE series_parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on series_parts" ON series_parts FOR ALL USING (true) WITH CHECK (true);~

-- ==================== series_accessories ====================
ALTER TABLE series_accessories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on series_accessories" ON series_accessories FOR ALL USING (true) WITH CHECK (true);

-- ==================== orders ====================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- ==================== order_items ====================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- ==================== order_accessories ====================
ALTER TABLE order_accessories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on order_accessories" ON order_accessories FOR ALL USING (true) WITH CHECK (true);

-- ==================== remnants ====================
ALTER TABLE remnants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on remnants" ON remnants FOR ALL USING (true) WITH CHECK (true);

-- ==================== user_profiles ====================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
