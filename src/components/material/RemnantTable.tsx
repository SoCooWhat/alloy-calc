'use client';

import { useEffect, useRef, useState } from 'react';
import { Table, Button, Space, Select, Popconfirm, message, Card, InputNumber, Form, Modal } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useRemnantStore } from '@/stores/remnantStore';
import { useMaterialStore } from '@/stores/materialStore';
import type { ColumnsType } from 'antd/es/table';

interface RemnantRow {
  id: string;
  material_id: string;
  material_name?: string;
  material_model?: string;
  remnant_length: number;
  quantity: number;
  source_order_id: string | null;
  created_at: string;
}

export function RemnantTable() {
  const { remnants, loading, fetchRemnants, addRemnant, deleteRemnant } = useRemnantStore();
  const { materials, fetchMaterials } = useMaterialStore();
  const [materialFilter, setMaterialFilter] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [form] = Form.useForm();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchRemnants();
      fetchMaterials();
    }
  }, [fetchRemnants, fetchMaterials]);

  const filtered = materialFilter
    ? remnants.filter(r => r.material_id === materialFilter)
    : remnants;

  const handleDelete = async (id: string) => {
    try {
      await deleteRemnant(id);
      message.success('删除成功');
    } catch {
      message.error('删除失败');
    }
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      await addRemnant({
        material_id: values.material_id,
        remnant_length: values.remnant_length,
        quantity: values.quantity || 1,
        source_order_id: null,
      });
      message.success('添加成功');
      setShowAdd(false);
      form.resetFields();
    } catch {
      // validation error or insert error
    }
  };

  const columns: ColumnsType<RemnantRow> = [
    {
      title: '型材',
      dataIndex: 'material_name',
      key: 'material_name',
      width: 150,
    },
    {
      title: '规格',
      dataIndex: 'material_model',
      key: 'material_model',
      width: 120,
    },
    {
      title: '余料长度(mm)',
      dataIndex: 'remnant_length',
      key: 'remnant_length',
      width: 120,
      render: (val: number) => (
        <span style={{ color: val >= 500 ? '#52c41a' : undefined, fontWeight: val >= 500 ? 'bold' : 'normal' }}>
          {val}mm
        </span>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: '入库时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (val: string) => val ? new Date(val).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm title="确定删除该余料？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="按型材筛选"
          value={materialFilter || undefined}
          onChange={v => setMaterialFilter(v || '')}
          style={{ width: 220 }}
          allowClear
          showSearch
          optionFilterProp="label"
          options={materials.map(m => ({
            label: `${m.name} - ${m.model}`,
            value: m.id,
          }))}
        />
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setShowAdd(true)}>
          添加余料
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `共 ${total} 条`,
        }}
        size="middle"
      />

      <Modal
        title="添加余料"
        open={showAdd}
        onOk={handleAdd}
        onCancel={() => { setShowAdd(false); form.resetFields(); }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="material_id"
            label="型材"
            rules={[{ required: true, message: '请选择型材' }]}
          >
            <Select
              placeholder="选择型材"
              showSearch
              optionFilterProp="label"
              options={materials.map(m => ({
                label: `${m.name} - ${m.model}`,
                value: m.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="remnant_length"
            label="余料长度(mm)"
            rules={[{ required: true, message: '请输入余料长度' }]}
          >
            <InputNumber min={1} max={9999} style={{ width: '100%' }} placeholder="如 1200" />
          </Form.Item>
          <Form.Item name="quantity" label="数量" initialValue={1}>
            <InputNumber min={1} max={9999} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
