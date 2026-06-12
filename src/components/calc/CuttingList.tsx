'use client';

import { Card, Typography, Tag, Tooltip, Row, Col, Statistic } from 'antd';
import { BlockOutlined } from '@ant-design/icons';
import type { CuttingList } from '@/types';

interface CuttingListProps {
  list: CuttingList;
  stats: {
    total_bars: number;
    average_utilization: number;
    total_remnant: number;
    remnant_over_500: number;
  };
}

export function CuttingListCard({ list, stats }: CuttingListProps) {
  // 颜色映射（不同部件用不同颜色）
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa8c16', '#2f54eb', '#a0d911',
  ];

  const getColor = (index: number) => colors[index % colors.length];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BlockOutlined />
          <span>排料图</span>
        </div>
      }
    >
      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Statistic
            title="总根数"
            value={stats.total_bars}
            suffix="根"
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="平均利用率"
            value={stats.average_utilization}
            suffix="%"
            precision={1}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="总余料"
            value={stats.total_remnant}
            suffix="mm"
            precision={0}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title="可复用余料"
            value={stats.remnant_over_500}
            suffix="根"
            valueStyle={{ color: stats.remnant_over_500 > 0 ? '#52c41a' : undefined }}
          />
        </Col>
      </Row>

      {/* 排料图 */}
      {list.bars.map((bar, barIndex) => (
        <div key={barIndex} style={{ marginBottom: 24 }}>
          <Typography.Title level={5}>
            {bar.material_name}
          </Typography.Title>

          {bar.layouts.map((layout, layoutIndex) => (
            <div
              key={layoutIndex}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8,
                padding: '8px 0',
              }}
            >
              <Typography.Text style={{ minWidth: 80, marginRight: 12 }}>
                第{layoutIndex + 1}根:
              </Typography.Text>

              {/* 料条可视化 */}
              <div
                style={{
                  flex: 1,
                  height: 40,
                  display: 'flex',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                {layout.segments.map((seg, segIndex) => {
                  const totalUsed = layout.segments.reduce(
                    (sum, s) => sum + s.length,
                    0
                  );
                  const percentage = (seg.length / 6000) * 100;

                  return (
                    <Tooltip
                      key={segIndex}
                      title={`${seg.partName}: ${seg.length}mm`}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: getColor(segIndex),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRight: '1px solid white',
                          minWidth: 30,
                        }}
                      >
                        <span
                          style={{
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 'bold',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            padding: '0 4px',
                          }}
                        >
                          {seg.length}
                        </span>
                      </div>
                    </Tooltip>
                  );
                })}

                {/* 余料 */}
                {layout.remnant > 0 && (
                  <Tooltip title={`余料: ${layout.remnant}mm`}>
                    <div
                      style={{
                        width: `${(layout.remnant / 6000) * 100}%`,
                        height: '100%',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 20,
                      }}
                    >
                      <span style={{ fontSize: 10, color: '#999' }}>
                        {layout.remnant}
                      </span>
                    </div>
                  </Tooltip>
                )}
              </div>

              {/* 利用率 */}
              <Tag
                color={layout.utilizationRate >= 80 ? 'green' : layout.utilizationRate >= 60 ? 'orange' : 'red'}
                style={{ marginLeft: 12 }}
              >
                {layout.utilizationRate}%
              </Tag>
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
}
