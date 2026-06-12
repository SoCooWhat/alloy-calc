'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, message, Card, Typography, Space, Breadcrumb, Tabs } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, HomeOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useSeriesStore } from '@/stores/seriesStore';
import { useMaterialStore } from '@/stores/materialStore';
import { useAccessoryStore } from '@/stores/accessoryStore';
import { SeriesBasicInfo } from '@/components/series/SeriesBasicInfo';
import { PartsTreeView } from '@/components/series/PartsTreeView';
import { SeriesAccessoriesView } from '@/components/series/SeriesAccessoriesView';
import type { Series, SeriesGroup, SeriesAccessory } from '@/types';

interface SeriesEditorPageProps {
  mode: 'create' | 'edit';
  series?: Series;
}

export function SeriesEditorPage({ mode, series }: SeriesEditorPageProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [groups, setGroups] = useState<Partial<SeriesGroup>[]>([]);
  const [accessories, setAccessories] = useState<Partial<SeriesAccessory>[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  const { saveSeriesWithDetails, loading } = useSeriesStore();
  const { fetchMaterials } = useMaterialStore();
  const { fetchAccessories } = useAccessoryStore();

  useEffect(() => {
    fetchMaterials();
    fetchAccessories();

    if (mode === 'edit' && series) {
      form.setFieldsValue({
        name: series.name,
        brand: series.brand,
        system_name: series.system_name,
        product_type: series.product_type,
        description: series.description,
      });
      setTimeout(() => {
        setGroups(series.groups || []);
        setAccessories(series.accessories || []);
      }, 0);
    }
  }, [mode, series, form, fetchMaterials, fetchAccessories]);

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      message.error('请填写必填项');
      setActiveTab('info');
      return;
    }

    const values = form.getFieldsValue(true);

    if (!values.name?.trim()) {
      message.error('请输入系列名称');
      setActiveTab('info');
      return;
    }
    if (!values.brand?.trim()) {
      message.error('请输入品牌');
      setActiveTab('info');
      return;
    }
    if (!values.system_name?.trim()) {
      message.error('请输入系列号');
      setActiveTab('info');
      return;
    }
    if (!values.product_type) {
      message.error('请选择产品类型');
      setActiveTab('info');
      return;
    }

    // 验证至少有一个分组和部件
    const hasParts = groups.some(g => g.parts && g.parts.length > 0);
    if (!hasParts) {
      message.error('请至少在一个分组下添加一个型材部件');
      setActiveTab('parts');
      return;
    }

    const seriesData = {
      name: values.name.trim(),
      brand: values.brand.trim(),
      system_name: values.system_name.trim(),
      product_type: values.product_type,
      description: values.description || '',
      id: series?.id,
      status: series?.status || 1,
    };

    try {
      await saveSeriesWithDetails(seriesData, groups, accessories, mode === 'edit');
      message.success(mode === 'edit' ? '系列更新成功' : '系列创建成功');
      router.push('/series');
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || '保存失败');
    }
  };

  const handleGoCalc = () => {
    if (series?.id) {
      router.push(`/series/${series.id}/calc`);
    }
  };

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: <SeriesBasicInfo form={form} />,
    },
    {
      key: 'parts',
      label: `型材配方 (${groups.reduce((s, g) => s + (g.parts?.length || 0), 0)})`,
      children: <PartsTreeView groups={groups} onGroupsChange={setGroups} />,
    },
    {
      key: 'accessories',
      label: `配件方案 (${accessories.length})`,
      children: <SeriesAccessoriesView accessories={accessories} onAccessoriesChange={setAccessories} />,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          { title: <HomeOutlined />, href: '/dashboard' },
          { title: '型材系列', href: '/series' },
          { title: mode === 'edit' ? '编辑系列' : '创建系列' },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Typography.Title level={2} style={{ marginBottom: 8 }}>
            {mode === 'edit' ? '编辑系列' : '创建新系列'}
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 16 }}>
            {mode === 'edit' ? '修改系列配置，优化产品配方' : '配置型材系列，设置树形部件结构和配件方案'}
          </Typography.Text>
        </div>
        {mode === 'edit' && series?.id && (
          <Button icon={<CalculatorOutlined />} onClick={handleGoCalc}>
            去算料
          </Button>
        )}
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} size="large" />
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button size="large" onClick={() => router.push('/series')} icon={<ArrowLeftOutlined />}>
            返回系列列表
          </Button>
          <Space size="middle">
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              {mode === 'edit' ? '保存修改' : '保存系列'}
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
}
