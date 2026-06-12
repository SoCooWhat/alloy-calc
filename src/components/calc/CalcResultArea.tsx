'use client';

import { useState } from 'react';
import { Tabs, Card, Typography, Button, Space, message } from 'antd';
import {
  DollarOutlined, FileTextOutlined, ShoppingCartOutlined,
  BlockOutlined, DownloadOutlined, PrinterOutlined, PlusOutlined,
} from '@ant-design/icons';
import { useCalcStore } from '@/stores/calcStore';
import { CostSummaryCard } from './CostSummaryCard';
import { ProfileResultTable } from './ProfileResultTable';
import { AccessoryResultTable } from './AccessoryResultTable';
import { PurchaseListCard } from './PurchaseList';
import { CuttingListCard } from './CuttingList';
import { CreateOrderModal } from '@/components/order/CreateOrderModal';

interface CalcResultAreaProps {
  seriesId?: string;
  seriesName?: string;
  productType?: string;
  sizeSpecs?: { width: number; height: number; qty: number }[];
}

export function CalcResultArea({ seriesId, seriesName, productType, sizeSpecs }: CalcResultAreaProps) {
  const { result, loading, error } = useCalcStore();
  const [showOrderModal, setShowOrderModal] = useState(false);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Typography.Title level={4} style={{ color: '#999' }}>
            计算中...
          </Typography.Title>
          <Typography.Text type="secondary">
            正在进行算料计算，请稍候
          </Typography.Text>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Typography.Title level={4} style={{ color: '#ff4d4f' }}>
            计算失败
          </Typography.Title>
          <Typography.Text type="danger">{error}</Typography.Text>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Typography.Title level={4} style={{ color: '#999' }}>
            暂无计算结果
          </Typography.Title>
          <Typography.Text type="secondary">
            请先配置系列和尺寸规格，然后点击&quot;开始算料&quot;
          </Typography.Text>
        </div>
      </Card>
    );
  }

  const handleCreateOrder = () => {
    if (!result) {
      message.error('请先进行算料计算');
      return;
    }
    setShowOrderModal(true);
  };

  const handlePrintPurchaseList = () => {
    message.info('打印功能开发中');
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <DollarOutlined />
          费用汇总
        </span>
      ),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <CostSummaryCard summary={result.cost_summary} />
          <ProfileResultTable results={result.profile_results} />
        </Space>
      ),
    },
    {
      key: 'materials',
      label: (
        <span>
          <FileTextOutlined />
          型材明细
        </span>
      ),
      children: <ProfileResultTable results={result.profile_results} />,
    },
    {
      key: 'accessories',
      label: (
        <span>
          <ShoppingCartOutlined />
          配件明细
        </span>
      ),
      children: <AccessoryResultTable results={result.accessory_results} />,
    },
    {
      key: 'purchase',
      label: (
        <span>
          <ShoppingCartOutlined />
          采购清单
        </span>
      ),
      children: (
        <PurchaseListCard
          list={result.purchase_list}
          onPrint={handlePrintPurchaseList}
        />
      ),
    },
    {
      key: 'cutting',
      label: (
        <span>
          <BlockOutlined />
          排料图
        </span>
      ),
      children: (
        <CuttingListCard
          list={result.cutting_list}
          stats={result.nesting_stats}
        />
      ),
    },
  ];

  return (
    <div>
      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            算料结果
          </Typography.Title>
          <Space>
            <Button icon={<DownloadOutlined />}>
              导出Excel
            </Button>
            <Button icon={<PrinterOutlined />}>
              打印报价单
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOrder}>
              生成订单
            </Button>
          </Space>
        </div>
      </Card>

      {/* 结果标签页 */}
      <Card>
        <Tabs
          defaultActiveKey="overview"
          items={tabItems}
          size="large"
        />
      </Card>

      {/* 创建订单弹窗 */}
      {result && seriesId && (
        <CreateOrderModal
          open={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          calcResult={result}
          seriesId={seriesId}
          seriesName={seriesName || ''}
          productType={productType || ''}
          sizeSpecs={sizeSpecs || []}
        />
      )}
    </div>
  );
}
