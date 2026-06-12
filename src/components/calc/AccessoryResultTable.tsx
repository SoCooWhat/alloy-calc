'use client';

import { Table, Typography, Tag } from 'antd';
import type { AccessoryCalcResult, CalcMethod } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const calcMethodLabels: Record<CalcMethod, string> = {
  per_sash: '每扇',
  per_area: '按面积',
  perimeter: '按周长',
  per_corner: '每个角',
  fixed: '固定数量',
};

interface AccessoryResultTableProps {
  results: AccessoryCalcResult[];
}

export function AccessoryResultTable({ results }: AccessoryResultTableProps) {
  const columns: ColumnsType<AccessoryCalcResult> = [
    {
      title: '配件名称',
      dataIndex: 'accessory_name',
      key: 'accessory_name',
      width: 250,
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: '计算规则',
      dataIndex: 'calc_method',
      key: 'calc_method',
      width: 100,
      render: (val) => <Tag>{calcMethodLabels[val as CalcMethod] || val}</Tag>,
    },
    {
      title: '数量',
      dataIndex: 'total_qty',
      key: 'total_qty',
      width: 100,
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: '单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      render: (val) => `¥${val.toFixed(2)}`,
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (val) => <Typography.Text strong>¥{val.toFixed(2)}</Typography.Text>,
    },
    {
      title: '说明',
      dataIndex: 'calc_desc',
      key: 'calc_desc',
      width: 150,
      render: (val) => <Typography.Text type="secondary">{val || '-'}</Typography.Text>,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={results}
      rowKey="accessory_id"
      pagination={false}
      scroll={{ x: 700 }}
      size="middle"
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>
              <Typography.Text strong>合计</Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>-</Table.Summary.Cell>
            <Table.Summary.Cell index={2}>-</Table.Summary.Cell>
            <Table.Summary.Cell index={3}>-</Table.Summary.Cell>
            <Table.Summary.Cell index={4}>
              <Typography.Text strong>
                ¥{results.reduce((sum, r) => sum + r.subtotal, 0).toFixed(2)}
              </Typography.Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={5}>-</Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    />
  );
}
