'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Typography } from 'antd';
import { useSeriesStore } from '@/stores/seriesStore';
import { SeriesEditorPage } from '@/components/series/SeriesEditorPage';

export default function EditSeriesPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;

  const { currentSeries, fetchSeries, loading } = useSeriesStore();

  useEffect(() => {
    if (seriesId) {
      fetchSeries(seriesId);
    }
  }, [seriesId, fetchSeries]);

  if (loading) {
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
        <Typography.Text type="secondary">请检查链接是否正确</Typography.Text>
      </div>
    );
  }

  return <SeriesEditorPage mode="edit" series={currentSeries} />;
}
