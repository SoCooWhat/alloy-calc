'use client';

export const runtime = 'edge';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTemplateStore } from '@/stores/templateStore';
import { TemplateEditorPage } from '@/components/template/TemplateEditorPage';
import { Typography, Spin } from 'antd';

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;
  const { currentTemplate, fetchTemplate, loading } = useTemplateStore();

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载模板中...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Typography.Title level={3}>模板不存在</Typography.Title>
      </div>
    );
  }

  return <TemplateEditorPage mode="edit" template={currentTemplate} />;
}
