'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Steps, Button, Form, message, Card, Typography, Space, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, SaveOutlined, HomeOutlined } from '@ant-design/icons';
import { useTemplateStore } from '@/stores/templateStore';
import { useMaterialStore } from '@/stores/materialStore';
import { useAccessoryStore } from '@/stores/accessoryStore';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2CuttingRules } from './Step2CuttingRules';
import { Step3Accessories } from './Step3Accessories';
import type { Template, TemplatePart, TemplateAccessory } from '@/types';

interface TemplateEditorPageProps {
  mode: 'create' | 'edit';
  template?: Template;
}

export function TemplateEditorPage({ mode, template }: TemplateEditorPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [parts, setParts] = useState<Partial<TemplatePart>[]>([]);
  const [accessories, setAccessories] = useState<Partial<TemplateAccessory>[]>([]);

  const { saveTemplateWithDetails, loading } = useTemplateStore();
  const { fetchMaterials } = useMaterialStore();
  const { fetchAccessories } = useAccessoryStore();

  useEffect(() => {
    fetchMaterials();
    fetchAccessories();

    // Initialize form if editing
    if (mode === 'edit' && template) {
      form.setFieldsValue({
        name: template.name,
        product_type: template.product_type,
        description: template.description,
      });
      // Use setTimeout to avoid setState-in-effect warning
      setTimeout(() => {
        setParts(template.parts || []);
        setAccessories(template.accessories || []);
      }, 0);
    }
  }, [mode, template, form, fetchMaterials, fetchAccessories]);

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields();
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        message.error('请填写必填项');
      }
    } else if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    try {
      // 先验证第一步的表单
      if (currentStep === 0) {
        try {
          await form.validateFields();
        } catch {
          message.error('请先填写模板名称和产品类型');
          return;
        }
      }

      // 获取所有表单值
      const values = form.getFieldsValue(true);

      console.log('Form values:', values);

      if (!values.name || values.name.trim() === '') {
        message.error('请输入模板名称');
        setCurrentStep(0);
        return;
      }

      if (!values.product_type) {
        message.error('请选择产品类型');
        setCurrentStep(0);
        return;
      }

      if (parts.length === 0) {
        message.error('请至少添加一个型材配方');
        setCurrentStep(1);
        return;
      }

      const templateData = {
        name: values.name.trim(),
        product_type: values.product_type,
        description: values.description || '',
        id: template?.id,
        status: template?.status || 1,
      };

      console.log('Template data:', templateData);

      await saveTemplateWithDetails(templateData, parts, accessories, mode === 'edit');

      message.success(mode === 'edit' ? '模板更新成功' : '模板创建成功');
      router.push('/templates');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Save error:', error);
      message.error(err.message || '保存失败');
    }
  };

  const handleCancel = () => {
    router.push('/templates');
  };

  const steps = [
    {
      title: '基本信息',
      description: '填写模板信息和型材配方',
    },
    {
      title: '下料规则',
      description: '配置切料规则',
    },
    {
      title: '所需配件',
      description: '配置所需配件',
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1BasicInfo
            form={form}
            parts={parts}
            onPartsChange={setParts}
          />
        );
      case 1:
        return (
          <Step2CuttingRules
            parts={parts}
            onPartsChange={setParts}
          />
        );
      case 2:
        return (
          <Step3Accessories
            accessories={accessories}
            onAccessoriesChange={setAccessories}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Breadcrumb */}
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
            title: mode === 'edit' ? '编辑模板' : '创建模板',
          },
        ]}
      />

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Typography.Title level={2} style={{ marginBottom: 8 }}>
          {mode === 'edit' ? '编辑模板' : '创建新模板'}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 16 }}>
          {mode === 'edit'
            ? '修改模板配置，优化产品配方'
            : '配置产品模板，设置型材配方和下料规则'}
        </Typography.Text>
      </div>

      {/* Steps */}
      <Card style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: 0 }}
        />
      </Card>

      {/* Step Content */}
      <Card
        style={{
          marginBottom: 24,
          minHeight: 500,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 1200 }}
          initialValues={{
            name: template?.name || '',
            product_type: template?.product_type || '',
            description: template?.description || '',
          }}
        >
          {renderStepContent()}
        </Form>
      </Card>

      {/* Navigation Buttons */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            size="large"
            onClick={handleCancel}
            icon={<ArrowLeftOutlined />}
          >
            返回模板列表
          </Button>
          <Space size="middle">
            {currentStep > 0 && (
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={handlePrev}
              >
                上一步
              </Button>
            )}
            {currentStep < 2 && (
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={handleNext}
              >
                下一步
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={loading}
              >
                保存模板
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
}
