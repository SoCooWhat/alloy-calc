'use client';

import { Button, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

interface PrintButtonProps {
  contentRef: React.RefObject<HTMLDivElement>;
  title: string;
}

export function PrintButton({ contentRef, title }: PrintButtonProps) {
  const handlePrint = () => {
    if (!contentRef.current) {
      message.error('没有可打印的内容');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('无法打开打印窗口，请检查浏览器设置');
      return;
    }

    const content = contentRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1, h2, h3 {
              color: #1890ff;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .summary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .summary-item {
              display: inline-block;
              margin-right: 40px;
            }
            .summary-label {
              font-size: 12px;
              opacity: 0.8;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Button
      icon={<PrinterOutlined />}
      onClick={handlePrint}
    >
      打印
    </Button>
  );
}
