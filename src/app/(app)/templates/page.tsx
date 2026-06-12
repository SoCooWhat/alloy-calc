'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Button, Typography, Space, message, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTemplateStore } from '@/stores/templateStore';
import { TemplateCard } from '@/components/template/TemplateCard';
import type { Template } from '@/types';

export default function TemplatesPage() {
  const router = useRouter();
  const { templates, loading, fetchTemplates, deleteTemplate } = useTemplateStore();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = () => {
    router.push('/templates/create');
  };

  const handleEdit = (template: Template) => {
    router.push(`/templates/${template.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      message.success('删除成功');
    } catch {
      message.error('删除失败');
    }
  };

  const handleClick = (template: Template) => {
    // Navigate to calc page with template
    router.push(`/templates/${template.id}/calc`);
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              快捷模板
            </Typography.Title>
            <Typography.Text type="secondary">
              管理产品配方模板，配置后可快速进行算料计算
            </Typography.Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
            创建模板
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Typography.Text type="secondary" style={{ fontSize: 16 }}>加载中...</Typography.Text>
          </div>
        ) : templates.length === 0 ? (
          <Empty
            description={
              <div>
                <Typography.Title level={4} style={{ color: '#999' }}>暂无模板</Typography.Title>
                <Typography.Text type="secondary">
                  创建您的第一个产品模板，开始快速算料
                </Typography.Text>
              </div>
            }
            style={{ padding: '100px 0' }}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
              创建第一个模板
            </Button>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {templates.map((template) => (
              <Col key={template.id} xs={24} sm={12} lg={8} xl={6}>
                <TemplateCard
                  template={template}
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
