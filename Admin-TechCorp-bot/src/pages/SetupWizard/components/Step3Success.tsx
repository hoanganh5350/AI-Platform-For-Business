import React from 'react';
import { Card, Spin, Result, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../router/constants';

const { Title, Text } = Typography;

interface Step3SuccessProps {
  isSubmitting: boolean;
  businessId: string | null;
}

export const Step3Success: React.FC<Step3SuccessProps> = ({ isSubmitting, businessId }) => {
  const navigate = useNavigate();

  return (
    <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      {isSubmitting ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: 20 }}>Đang khởi tạo chatbot...</Title>
          <Text type="secondary">Vui lòng chờ trong giây lát</Text>
        </div>
      ) : (
        <Result
          status="success"
          title="Đã hoàn thành cấu hình chatbot cho doanh nghiệp của bạn!"
          subTitle="Hệ thống AI đã được thiết lập dựa trên thông tin và luồng màn hình bạn cung cấp."
          extra={[
            <div key="id-box" style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <Text strong style={{ fontSize: '18px' }}>Business ID:</Text>
              <Text copyable={{ text: businessId! }} style={{ fontSize: '18px', color: '#1890ff' }}>
                {businessId}
              </Text>
            </div>,
            <Button type="primary" key="dashboard" onClick={() => navigate(ROUTES.BUSINESS_INFO)}>
              Đến Bảng điều khiển
            </Button>,
          ]}
        />
      )}
    </Card>
  );
};
