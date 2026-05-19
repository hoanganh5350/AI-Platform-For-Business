import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, Skeleton, Select, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import type { BusinessConfig } from '../../api/types';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { TextArea } = Input;

interface ChatbotConfigForm {
  chatbotName: string;
  welcomeMessage: string;
  tone: string;
  language: string;
}

export const ChatbotConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const businessId = localStorage.getItem('currentBusinessId');
      if (!businessId) {
        notifyError('Không tìm thấy Business ID', 'Vui lòng đăng nhập lại.');
        return;
      }
      const res = await AdminAPI.getBusinessConfig(businessId);
      if (res.success && res.data) {
        setConfig(res.data);
        form.setFieldsValue({
          chatbotName: res.data.chatbotName,
          welcomeMessage: res.data.welcomeMessage,
          tone: res.data.tone || 'professional',
          language: res.data.language || 'auto',
        });
      }
    } catch {
      notifyError('Lỗi tải cấu hình', 'Không thể tải cấu hình chatbot. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: ChatbotConfigForm) => {
    if (!config) return;
    setSubmitting(true);
    try {
      await AdminAPI.updateBusinessInfoJwt(config.businessId, {
        chatbotName: values.chatbotName,
        welcomeMessage: values.welcomeMessage,
        tone: values.tone as BusinessConfig['tone'],
        language: values.language,
      });

      notifySuccess('Lưu thành công!', 'Cấu hình chatbot đã được cập nhật.');
      loadData();
    } catch {
      notifyError('Lưu thất bại', 'Đã có lỗi khi lưu cấu hình chatbot.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}><Skeleton active /></div>;
  }

  return (
    <AppThemeProvider>
      {contextHolder}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Title level={3} style={{ marginBottom: 24 }}>{t("chatbot.title")}</Title>
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: 'calc(100% - 80px)' }}>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item label={t("chatbot.name")} name="chatbotName" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            
            <Form.Item label={t("chatbot.welcome")} name="welcomeMessage" rules={[{ required: true }]}>
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item label={t("chatbot.tone")} name="tone">
              <Select
                options={[
                  { value: 'professional', label: t("chatbot.tone_prof") },
                  { value: 'friendly', label: t("chatbot.tone_friendly") },
                  { value: 'humorous', label: t("chatbot.tone_humorous") },
                ]}
              />
            </Form.Item>
            
            <Form.Item label={t("chatbot.lang")} name="language">
              <Select
                options={[
                  { value: 'auto', label: t("chatbot.lang_auto") },
                  { value: 'vi', label: t("chatbot.lang_vi") },
                  { value: 'en', label: t("chatbot.lang_en") },
                ]}
              />
            </Form.Item>
            
            <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                {t("common.save")}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </AppThemeProvider>
  );
};
