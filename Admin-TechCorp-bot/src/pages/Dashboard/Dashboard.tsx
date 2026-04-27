import { useEffect, useState } from 'react';
import { Button, Typography, Card, Skeleton } from 'antd';
import { RobotOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AdminAPI } from '../../api/client';
import { ROUTES } from '../../router/constants';

const { Title, Paragraph } = Typography;

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBusiness();
  }, []);

  const checkBusiness = async () => {
    const localId = localStorage.getItem('currentBusinessId');
    if (localId) {
      navigate(ROUTES.BUSINESS_INFO, { replace: true });
      return;
    }

    try {
      const res = await AdminAPI.getConfigs();
      if (res.success && res.data?.docs?.length > 0) {
        localStorage.setItem('currentBusinessId', res.data.docs[0].businessId);
        navigate(ROUTES.BUSINESS_INFO, { replace: true });
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh nghiệp:', error);
    } finally {
      setLoading(false);
    }
  };

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