import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Card, Typography, Skeleton, Space, Divider } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import type { BusinessConfig } from '../../api/types';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ── Custom field state (UI only — not persisted in a separate form field)
interface CustomField {
  id: string;
  title: string;
}

interface BusinessInfoForm {
  businessName: string;
  industry?: string;
  email?: string;
  phone?: string;
  website?: string;
  description: string;
  /** Dynamic extra sections keyed by field id */
  customFields?: Record<string, string>;
}

export const BusinessInfo: React.FC = () => {
  const [form] = Form.useForm<BusinessInfoForm>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const businessName = Form.useWatch('businessName', form);
  const description = Form.useWatch('description', form);

  // ── Custom fields state
  const [pendingTitle, setPendingTitle] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const { t } = useTranslation();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute submittable directly from watched values — no timing issues
  const submittable = useMemo(() => {
    return !!(businessName?.trim() && description?.trim());
  }, [businessName, description]);

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

        // Parse any custom sections previously embedded in description
        const raw: string = res.data.description || '';
        const separator = '\n\n--- Thông tin bổ sung ---\n';
        const sepIdx = raw.indexOf(separator);

        let baseDesc = raw;
        const restoredFields: CustomField[] = [];
        const restoredValues: Record<string, string> = {};

        if (sepIdx !== -1) {
          baseDesc = raw.substring(0, sepIdx);
          const extras = raw.substring(sepIdx + separator.length);
          // Each extra line: [Title]: value
          extras.split('\n').forEach((line, i) => {
            const match = line.match(/^\[(.+?)\]:\s*([\s\S]*)$/);
            if (match) {
              const title = match[1];
              // Skip corrupted entries where title is a raw internal ID (pure digits or custom_<digits>)
              // These were saved incorrectly before the fix — they remain in baseDesc text only
              const isRawId = /^\d+$/.test(title) || /^custom_\d+/.test(title);
              if (isRawId) return;
              const id = `custom_${i}_${Date.now()}`;
              restoredFields.push({ id, title });
              restoredValues[id] = match[2];
            }
          });
        }

        setCustomFields(restoredFields);
        form.setFieldsValue({
          businessName: res.data.businessName,
          industry: res.data.industry,
          email: res.data.email,
          phone: res.data.phone,
          website: res.data.website,
          description: baseDesc,
          customFields: restoredValues,
        });
      }
    } catch {
      notifyError('Lỗi tải dữ liệu', 'Không thể tải thông tin doanh nghiệp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomField = () => {
    const trimmed = pendingTitle.trim();
    if (!trimmed) return;
    const id = `custom_${Date.now()}`;
    setCustomFields((prev) => [...prev, { id, title: trimmed }]);
    setPendingTitle('');
  };

  const handleRemoveField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    const cur = form.getFieldValue('customFields') || {};
    delete cur[id];
    form.setFieldValue('customFields', { ...cur });
  };

  const handleSave = async (values: BusinessInfoForm) => {
    if (!config) return;
    setSubmitting(true);
    try {
      // Merge custom fields into description
      const customFieldsObj = values.customFields || {};
      const customSections = customFields
        .filter((f) => customFieldsObj[f.id]?.trim())
        .map((f) => `[${f.title}]: ${customFieldsObj[f.id]}`)
        .join('\n');
      const fullDescription = customSections
        ? `${values.description}\n\n--- Thông tin bổ sung ---\n${customSections}`
        : values.description;

      if (fullDescription !== config.description) {
        await AdminAPI.updateDescriptionJwt(config.businessId, fullDescription);
      }

      await AdminAPI.updateBusinessInfoJwt(config.businessId, {
        businessName: values.businessName,
        industry: values.industry,
        email: values.email,
        phone: values.phone,
        website: values.website,
      });

      notifySuccess('Lưu thành công!', 'Thông tin doanh nghiệp đã được cập nhật.');
      loadData();
    } catch {
      notifyError('Lưu thất bại', 'Đã có lỗi khi lưu thông tin. Vui lòng kiểm tra lại và thử lại.');
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
        <Title level={3} style={{ marginBottom: 24 }}>{t("business.title")}</Title>
        <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: 'calc(100% - 80px)' }}>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item 
              label={t("setup.business_name")}
              name="businessName" 
              rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item 
              label={t("setup.industry")}
              name="industry"
              rules={[{ required: true, message: 'Vui lòng nhập lĩnh vực / ngành nghề' }]}
            >
              <Input />
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
              label={t("business.desc_label")}
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả nghiệp vụ' }]}
            >
              <TextArea rows={8} />
            </Form.Item>

            {/* ── Dynamic custom description fields ── */}
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

            {/* ── Add custom field ── */}
            <Divider dashed style={{ marginTop: 4 }} />
            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
              {t("setup.add_custom")}
            </Text>
            <Space.Compact style={{ width: '100%', marginBottom: 24 }}>
              <Input
                value={pendingTitle}
                onChange={(e) => setPendingTitle(e.target.value)}
                placeholder='Nhập tiêu đề, ví dụ: "Chính sách đổi trả"'
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

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} disabled={!submittable}>
                {t("common.save")}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </AppThemeProvider>
  );
};
