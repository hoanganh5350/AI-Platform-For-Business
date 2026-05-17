import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Divider, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import { useTranslation } from 'react-i18next';
import { AdminAPI } from '../../../api/client';

const { TextArea } = Input;
const { Text } = Typography;

interface Step1BusinessInfoProps {
  form: FormInstance;
  onNext: () => void;
}

interface CustomField {
  id: string;
  title: string;
}

export const Step1BusinessInfo: React.FC<Step1BusinessInfoProps> = ({ form, onNext }) => {
  const [pendingTitle, setPendingTitle] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [submittable, setSubmittable] = useState(false);
  const values = Form.useWatch([], form);
  const { t } = useTranslation();

  // Auto-fill businessName from registered user info
  useEffect(() => {
    const prefillBusinessName = async () => {
      try {
        const res = await AdminAPI.getCurrentUser();
        if (res.success && res.data?.businessName) {
          // Only set if the field is currently empty
          const current = form.getFieldValue('businessName');
          if (!current) {
            form.setFieldValue('businessName', res.data.businessName);
          }
        }
      } catch {
        // silently ignore — user can type it manually
      }
    };
    prefillBusinessName();
  }, [form]);

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => setSubmittable(true),
      () => setSubmittable(false)
    );
  }, [values, form]);

  const handleAddCustomField = () => {
    const trimmed = pendingTitle.trim();
    if (!trimmed) return;
    const newId = `custom_${Date.now()}`;
    setCustomFields((prev) => [...prev, { id: newId, title: trimmed }]);
    // Also persist the title into the form so SetupWizard can read it
    form.setFieldValue(['customFieldTitles', newId], trimmed);
    setPendingTitle('');
  };

  const handleRemoveField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    form.setFieldValue(['customFields', id], undefined);
    form.setFieldValue(['customFieldTitles', id], undefined);
  };

  return (
    <Card
      title={t("setup.step1_title")}
      bordered={false}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t("setup.business_name")}
          name="businessName"
          rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
        >
          <Input placeholder="Ví dụ: Công ty TNHH Thương Mại ABC" />
        </Form.Item>

        <Form.Item 
          label={t("setup.rep")}
          name="representative"
          rules={[{ required: true, message: 'Vui lòng nhập tên người đại diện' }]}
        >
          <Input placeholder="Ví dụ: Nguyễn Văn A" />
        </Form.Item>

        <Form.Item 
          label={t("admin.email", "Email")}
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không đúng định dạng (ví dụ: contact@company.com)' },
          ]}
        >
          <Input placeholder="Ví dụ: contact@company.com" />
        </Form.Item>

        <Form.Item 
          label={t("admin.phone", "Số điện thoại")}
          name="phone"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            {
              pattern: /^(\+84|0)(3[2-9]|5[25689]|7[06-9]|8[0-689]|9[0-9])[0-9]{7}$/,
              message: 'Số điện thoại không hợp lệ (ví dụ: 0901234567 hoặc +84901234567)',
            },
          ]}
        >
          <Input placeholder="Ví dụ: 0901 234 567" maxLength={15} />
        </Form.Item>

        <Form.Item 
          label={t("setup.industry")}
          name="industry"
          rules={[{ required: true, message: 'Vui lòng nhập lĩnh vực/ngành nghề' }]}
        >
          <Input placeholder="Ví dụ: Thương mại điện tử, Bất động sản, Giáo dục..." />
        </Form.Item>

        <Form.Item 
          label={t("setup.website")}
          name="website"
          rules={[
            { required: true, message: 'Vui lòng nhập đường dẫn website' },
            {
              pattern: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\/[-a-zA-Z0-9@:%_+.~#?&/=]*)?$/,
              message: 'Đường dẫn không hợp lệ. Phải bắt đầu bằng http:// hoặc https://',
            },
          ]}
        >
          <Input placeholder="https://www.example.com" />
        </Form.Item>

        <Form.Item
          label={t("setup.desc")}
          name="description"
          rules={[{ required: true, message: 'Vui lòng mô tả nghiệp vụ' }]}
        >
          <TextArea rows={4} placeholder="Mô tả hoạt động kinh doanh, sản phẩm/dịch vụ chính của doanh nghiệp..." />
        </Form.Item>

        <Form.Item 
          label={t("setup.goal")}
          name="goal"
          rules={[{ required: true, message: 'Vui lòng nhập mục tiêu của chatbot' }]}
        >
          <Input placeholder="Ví dụ: Chăm sóc khách hàng, Tư vấn bán hàng" />
        </Form.Item>

        {/* ── Dynamic Custom Fields ── */}
        {customFields.length > 0 && (
          <>
            <Divider orientation="left" style={{ fontSize: 13, color: '#888' }}>
              {t("setup.custom_fields")}
            </Divider>
            {customFields.map((field) => (
              <Form.Item
                key={field.id}
                label={
                  <Space>
                    <span>{field.title}</span>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveField(field.id)}
                      title="Xóa trường này"
                    />
                  </Space>
                }
                name={['customFields', field.id]}
                rules={[{ required: true, message: `Vui lòng nhập ${field.title}` }]}
              >
                <TextArea rows={2} placeholder={`Nhập ${field.title}...`} />
              </Form.Item>
            ))}
          </>
        )}

        {/* ── Add custom field section ── */}
        <Divider dashed style={{ marginTop: 4 }} />
        <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
          {t("setup.add_custom")}
        </Text>
        <Space.Compact style={{ width: '100%', marginBottom: 24 }}>
          <Input
            value={pendingTitle}
            onChange={(e) => setPendingTitle(e.target.value)}
            placeholder='Nhập tiêu đề trường, ví dụ: "Chính sách đổi trả"'
            onPressEnter={handleAddCustomField}
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddCustomField}
            disabled={!pendingTitle.trim()}
          >
            {t("setup.add_desc_btn")}
          </Button>
        </Space.Compact>

        <Button type="primary" onClick={onNext} block size="large" disabled={!submittable}>
          {t("common.next")}
        </Button>
      </Form>
    </Card>
  );
};
