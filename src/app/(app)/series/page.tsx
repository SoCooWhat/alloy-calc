'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Button, Typography, Space, Empty, Input, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useSeriesStore } from '@/stores/seriesStore';
import { SeriesCard } from '@/components/series/SeriesCard';
import type { Series } from '@/types';

export default function SeriesPage() {
  const router = useRouter();
  const { seriesList, loading, fetchSeriesList, deleteSeries } = useSeriesStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSeriesList();
  }, [fetchSeriesList]);

  const handleCreate = () => {
    router.push('/series/create');
  };

  const handleEdit = (series: Series) => {
    router.push(`/series/${series.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSeries(id);
      message.success('删除成功');
    } catch {
      message.error('删除失败');
    }
  };

  const handleClick = (series: Series) => {
    router.push(`/series/${series.id}/calc`);
  };

  const filtered = seriesList.filter(s =>
    s.name.includes(search) || s.brand.includes(search) || s.product_type.includes(search)
  );

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              型材系列管理
            </Typography.Title>
            <Typography.Text type="secondary">
              配置一套系列，永久复用。每个系列包含完整的型材配方、切料规则和配件方案
            </Typography.Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
            新建系列
          </Button>
        </div>

        <Input
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索系列名称、品牌、产品类型..."
          size="large"
          allowClear
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Typography.Text type="secondary" style={{ fontSize: 16 }}>加载中...</Typography.Text>
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            description={
              <div>
                <Typography.Title level={4} style={{ color: '#999' }}>
                  {search ? '未找到匹配的系列' : '暂无型材系列'}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {search ? '请尝试其他关键词' : '创建您的第一个型材系列，开始快速算料'}
                </Typography.Text>
              </div>
            }
            style={{ padding: '100px 0' }}
          >
            {!search && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
                创建第一个系列
              </Button>
            )}
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {filtered.map((series) => (
              <Col key={series.id} xs={24} sm={12} lg={8} xl={6}>
                <SeriesCard
                  series={series}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={handleClick}
                />
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
}
