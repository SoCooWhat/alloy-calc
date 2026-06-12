'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card, Typography, InputNumber, Button, Space, Table, message,
  Breadcrumb, Row, Col, Divider, Tag, Switch, Radio,
} from 'antd';
import {
  HomeOutlined, CalculatorOutlined, PlusOutlined,
  DeleteOutlined, ArrowLeftOutlined,
} from '@ant-design/icons';
import { useSeriesStore } from '@/stores/seriesStore';
import { useCalcStore } from '@/stores/calcStore';
import { CalcResultArea } from '@/components/calc/CalcResultArea';
import type { SizeSpec, CasingType } from '@/types';
import type { ColumnsType } from 'antd/es/table';

export default function SeriesCalcPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;

  const { currentSeries, fetchSeries, loading: seriesLoading, incrementUsage } = useSeriesStore();
  const { calculate, loading: calcLoading, result, clearResult } = useCalcStore();

  const [sizeSpecs, setSizeSpecs] = useState<SizeSpec[]>([
    { width: 1200, height: 1500, qty: 10, wall_thickness: 240 },
  ]);
  const [useRemnants, setUseRemnants] = useState(false);
  const [casingType, setCasingType] = useState<CasingType>('none');

  useEffect(() => {
    if (seriesId) {
      fetchSeries(seriesId);
      clearResult();
    }
  }, [seriesId, fetchSeries, clearResult]);

  const handleAddSpec = () => {
    setSizeSpecs([...sizeSpecs, { width: 1200, height: 1500, qty: 1, wall_thickness: sizeSpecs[0]?.wall_thickness || 240 }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSizeSpecs(sizeSpecs.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: keyof SizeSpec, value: number) => {
    const newSpecs = [...sizeSpecs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setSizeSpecs(newSpecs);
  };

  const handleCalculate = async () => {
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

    await calculate(seriesId, sizeSpecs, useRemnants, casingType);

    if (!useCalcStore.getState().error) {
      message.success('计算完成');
      incrementUsage(seriesId);
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
      title: '墙厚 (mm)',
      dataIndex: 'wall_thickness',
      key: 'wall_thickness',
      render: (_, record, index) => (
        <InputNumber
          value={record.wall_thickness}
          onChange={(value) => handleSpecChange(index, 'wall_thickness', value || 0)}
          min={0}
          placeholder="如 240"
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

  if (seriesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Typography.Title level={3}>加载中...</Typography.Title>
      </div>
    );
  }

  if (!currentSeries) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Typography.Title level={3}>系列不存在</Typography.Title>
        <Button onClick={() => router.push('/series')}>返回系列列表</Button>
      </div>
    );
  }

  const partCount = currentSeries.groups?.reduce((s, g) => s + (g.parts?.length || 0), 0) || 0;

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          { title: <HomeOutlined />, href: '/dashboard' },
          { title: '型材系列', href: '/series' },
          { title: currentSeries.name },
        ]}
      />

      {/* 系列信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size={4}>
              <Space size={8}>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  <CalculatorOutlined style={{ marginRight: 12 }} />
                  {currentSeries.name}
                </Typography.Title>
                <Tag color="blue">{currentSeries.brand}</Tag>
                <Tag color="green">{currentSeries.system_name}</Tag>
              </Space>
              <Typography.Text type="secondary">
                产品类型: {currentSeries.product_type} | 型材: {partCount}种 | 配件: {currentSeries.accessories?.length || 0}种
              </Typography.Text>
            </Space>
          </Col>
          <Col>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/series')}>
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
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSpec}>
            添加规格
          </Button>
        }
      >
        <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
          输入门的尺寸规格，支持多种规格同时计算
        </Typography.Paragraph>

        <Table
          columns={specColumns}
          dataSource={sizeSpecs.map((spec, index) => ({ ...spec, index }))}
          rowKey="index"
          pagination={false}
          size="small"
        />

        {/* 包套类型选择 */}
        <Divider />
        <div style={{ marginBottom: 16 }}>
          <Typography.Text style={{ marginRight: 16, fontWeight: 500 }}>包套类型：</Typography.Text>
          <Radio.Group value={casingType} onChange={e => setCasingType(e.target.value)}>
            <Radio.Button value="none">无包套</Radio.Button>
            <Radio.Button value="single">单包套</Radio.Button>
            <Radio.Button value="double">双包套</Radio.Button>
          </Radio.Group>
        </div>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Space size="large" align="center">
            <Space>
              <Typography.Text>优先使用余料</Typography.Text>
              <Switch
                checked={useRemnants}
                onChange={setUseRemnants}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </Space>
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
          </Space>
        </div>
      </Card>

      {/* 计算结果 */}
      <CalcResultArea
        seriesId={seriesId}
        seriesName={currentSeries.name}
        productType={currentSeries.product_type}
        sizeSpecs={sizeSpecs}
      />
    </div>
  );
}
