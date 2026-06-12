'use client';

export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  Typography,
  InputNumber,
  Button,
  Space,
  Table,
  message,
  Breadcrumb,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  HomeOutlined,
  CalculatorOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useTemplateStore } from '@/stores/templateStore';
import { useCalcStore } from '@/stores/calcStore';
import { CalcResultArea } from '@/components/calc/CalcResultArea';
import type { SizeSpec } from '@/types';
import type { ColumnsType } from 'antd/es/table';

export default function CalcPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const { currentTemplate, fetchTemplate, loading: templateLoading } = useTemplateStore();
  const { calculate, loading: calcLoading, result, clearResult } = useCalcStore();

  const [sizeSpecs, setSizeSpecs] = useState<SizeSpec[]>([
    { width: 1000, height: 1500, qty: 10 },
  ]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
      clearResult();
    }
  }, [templateId]);

  const handleAddSpec = () => {
    setSizeSpecs([...sizeSpecs, { width: 1000, height: 1500, qty: 1 }]);
  };

  const handleRemoveSpec = (index: number) => {
    const newSpecs = sizeSpecs.filter((_, i) => i !== index);
    setSizeSpecs(newSpecs);
  };

  const handleSpecChange = (index: number, field: keyof SizeSpec, value: number) => {
    const newSpecs = [...sizeSpecs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSizeSpecs(newSpecs);
  };

  const handleCalculate = async () => {
    // 验证
    if (sizeSpecs.length === 0) {
      message.error('请至少添加一个尺寸规格');
      return;
    }

    for (const spec of sizeSpecs) {
      if (spec.width <= 0 || spec.height <= 0 || spec.qty <= 0) {
        message.error('尺寸和数量必须大于0');
        return;
      }
    }

    await calculate(templateId, sizeSpecs);

    if (!useCalcStore.getState().error) {
      message.success('计算完成');
    }
  };

  const specColumns: ColumnsType<SizeSpec & { index: number }> = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '宽度 (mm)',
      dataIndex: 'width',
      key: 'width',
      render: (_, record, index) => (
        <InputNumber
          value={record.width}
          onChange={(value) => handleSpecChange(index, 'width', value || 0)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '高度 (mm)',
      dataIndex: 'height',
      key: 'height',
      render: (_, record, index) => (
        <InputNumber
          value={record.height}
          onChange={(value) => handleSpecChange(index, 'height', value || 0)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '数量',
      dataIndex: 'qty',
      key: 'qty',
      render: (_, record, index) => (
        <InputNumber
          value={record.qty}
          onChange={(value) => handleSpecChange(index, 'qty', value || 0)}
          min={1}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      render: (_, record, index) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveSpec(index)}
          disabled={sizeSpecs.length <= 1}
        />
      ),
    },
  ];

  if (templateLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Typography.Title level={3}>加载中...</Typography.Title>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Typography.Title level={3}>模板不存在</Typography.Title>
        <Button onClick={() => router.push('/templates')}>返回模板列表</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 面包屑 */}
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          {
            title: <HomeOutlined />,
            href: '/dashboard',
          },
          {
            title: '快捷模板',
            href: '/templates',
          },
          {
            title: currentTemplate.name,
          },
        ]}
      />

      {/* 模板信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                <CalculatorOutlined style={{ marginRight: 12 }} />
                {currentTemplate.name}
              </Typography.Title>
              <Typography.Text type="secondary">
                产品类型: {currentTemplate.product_type} | 型材: {currentTemplate.parts?.length || 0}种 | 配件: {currentTemplate.accessories?.length || 0}种
              </Typography.Text>
            </Space>
          </Col>
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/templates')}
            >
              返回列表
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 尺寸规格输入 */}
      <Card
        title="尺寸规格配置"
        style={{ marginBottom: 24 }}
        extra={
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddSpec}
          >
            添加规格
          </Button>
        }
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          配置门的尺寸规格，支持多种规格同时计算
        </Typography.Paragraph>

        <Table
          columns={specColumns}
          dataSource={sizeSpecs.map((spec, index) => ({ ...spec, index }))}
          rowKey="index"
          pagination={false}
          size="small"
        />

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<CalculatorOutlined />}
            onClick={handleCalculate}
            loading={calcLoading}
            style={{ minWidth: 200, height: 50 }}
          >
            开始算料
          </Button>
        </div>
      </Card>

      {/* 计算结果 */}
      <CalcResultArea />
    </div>
  );
}
