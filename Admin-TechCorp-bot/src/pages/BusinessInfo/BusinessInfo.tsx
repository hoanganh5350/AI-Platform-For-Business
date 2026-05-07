import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, Skeleton, Space, Divider } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import type { BusinessConfig } from '../../api/types';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';

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
  contact?: string;
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

  // ── Custom fields state
  const [pendingTitle, setPendingTitle] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();

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
          contact: res.data.contact,
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
        contact: values.contact,
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

            <Form.Item
              label="Mô tả nghiệp vụ / Kiến thức cơ sở cho AI"
              name="description"
              rules={[{ required: true }]}
            >
              <TextArea rows={8} />
            </Form.Item>

            {/* ── Dynamic custom description fields ── */}
            {customFields.length > 0 && (
              <>
                <Divider orientation="left" style={{ fontSize: 13, color: '#888' }}>
                  Mô tả bổ sung
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
                  >
                    <TextArea rows={2} placeholder={`Nhập ${field.title}...`} />
                  </Form.Item>
                ))}
              </>
            )}

            {/* ── Add custom field ── */}
            <Divider dashed style={{ marginTop: 4 }} />
            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
              Thêm trường mô tả tùy chỉnh (tuỳ chọn)
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
                Tạo thêm mô tả
              </Button>
            </Space.Compact>

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                Lưu thay đổi
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </AppThemeProvider>
  );
};
