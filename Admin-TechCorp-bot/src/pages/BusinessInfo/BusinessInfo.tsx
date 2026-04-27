import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Skeleton, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import type { BusinessConfig } from '../../api/types';

const { Title } = Typography;
const { TextArea } = Input;

interface BusinessInfoForm {
  businessName: string;
  industry?: string;
  contact?: string;
  website?: string;
  description: string;
}

export const BusinessInfo: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState<BusinessConfig | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const businessId = localStorage.getItem('currentBusinessId');
      if (!businessId) {
        message.error('Không tìm thấy Business ID');
        return;
      }
      const res = await AdminAPI.getConfig(businessId);
      if (res.success && res.data) {
        setConfig(res.data);
        form.setFieldsValue({
          businessName: res.data.businessName,
          industry: res.data.industry,
          contact: res.data.contact,
          website: res.data.website,
          description: res.data.description,
        });
      }
    } catch {
      message.error('Lỗi khi tải thông tin doanh nghiệp');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: BusinessInfoForm) => {
    if (!config) return;
    setSubmitting(true);
    try {
      if (values.description !== config.description) {
        await AdminAPI.updateDescription(config.businessId, values.description);
      }

      await AdminAPI.updateBusinessInfo(config.businessId, {
        businessName: values.businessName,
        industry: values.industry,
        contact: values.contact,
        website: values.website,
      });

      message.success('Đã lưu thông tin doanh nghiệp thành công!');
      loadData(); // reload
    } catch {
      message.error('Lỗi khi lưu thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}><Skeleton active /></div>;
  }

  return (
    <div style={{ display: 'flex',flexDirection:'column', justifyContent: 'center', alignItems: 'center'}}>
      <Title level={3} style={{ marginBottom: 24 }}>Thông tin Doanh nghiệp</Title>
      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: 'calc(100% - 80px)' }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Tên doanh nghiệp" name="businessName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          
          <Form.Item label="Lĩnh vực / Ngành nghề" name="industry">
            <Input />
          </Form.Item>
          
          <Form.Item label="Thông tin liên hệ (Email / SĐT)" name="contact">
            <Input />
          </Form.Item>
          
          <Form.Item label="Đường dẫn Website" name="website">
            <Input />
          </Form.Item>
          
          <Form.Item label="Mô tả nghiệp vụ / Kiến thức cơ sở cho AI" name="description" rules={[{ required: true }]}>
            <TextArea rows={8} />
          </Form.Item>
          
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
              Lưu thay đổi
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};
