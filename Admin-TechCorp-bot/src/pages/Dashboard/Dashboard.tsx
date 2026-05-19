import { Button, Typography, Card, Skeleton } from 'antd';
import { RobotOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../router/constants';

const { Title, Paragraph } = Typography;

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If currentBusinessId is already set (user has config), redirect to business info
    const localId = localStorage.getItem('currentBusinessId');
    if (localId) {
      navigate(ROUTES.BUSINESS_INFO, { replace: true });
      return;
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateChatbot = () => {
    navigate(ROUTES.SETUP);
  };

  if (loading) {
    return <div style={{ padding: 40 }}><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  // State 1: No Business Created -> Show Welcome Screen
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card style={{ maxWidth: 600, textAlign: 'center', padding: '40px 20px', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <RobotOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
        <Title level={2}>Chào mừng đến với nền tảng AI Chatbot</Title>
        <Paragraph style={{ fontSize: 16, color: '#555', marginBottom: 32 }}>
          Hệ thống quản lý chatbot thông minh dành riêng cho doanh nghiệp của bạn. 
          Hãy bắt đầu bằng cách khởi tạo cấu hình và huấn luyện AI hiểu về doanh nghiệp của bạn.
        </Paragraph>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreateChatbot} style={{ height: 48, padding: '0 32px', fontSize: 16, borderRadius: 24 }}>
          Tạo Chatbot cho Doanh nghiệp của bạn
        </Button>
      </Card>
    </div>
  );
};