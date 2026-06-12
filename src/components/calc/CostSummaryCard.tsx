'use client';

import { Card, Typography, Row, Col, Statistic, Tag } from 'antd';
import { ColumnHeightOutlined, DollarOutlined, BarChartOutlined, ScissorOutlined } from '@ant-design/icons';
import type { CostSummary } from '@/types';

interface CostSummaryCardProps {
  summary: CostSummary;
}

export function CostSummaryCard({ summary }: CostSummaryCardProps) {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarOutlined />
          <span>费用汇总</span>
        </div>
      }
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
      styles={{
        header: { color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)' },
      }}
    >
      <Row gutter={[24, 16]}>
        <Col xs={12} sm={6}>
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>总重量</span>}
            value={summary.total_weight}
            precision={2}
            suffix="kg"
            prefix={<ColumnHeightOutlined />}
            valueStyle={{ color: 'white' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>材料费</span>}
            value={summary.total_material_cost}
            precision={2}
            prefix="¥"
            valueStyle={{ color: 'white' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>配件费</span>}
            value={summary.total_accessory_cost}
            precision={2}
            prefix="¥"
            valueStyle={{ color: 'white' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>总成本</span>}
            value={summary.total_cost}
            precision={2}
            prefix="¥"
            valueStyle={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}
          />
        </Col>
      </Row>
    </Card>
  );
}
