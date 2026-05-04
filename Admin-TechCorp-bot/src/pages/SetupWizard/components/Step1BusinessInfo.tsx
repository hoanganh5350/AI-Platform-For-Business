import React, { useState } from 'react';
import { Form, Input, Button, Card, Divider, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

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
      title="Khởi tạo Chatbot cho Doanh nghiệp"
      bordered={false}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên doanh nghiệp"
          name="businessName"
          rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
        >
          <Input placeholder="Nhập tên doanh nghiệp của bạn" />
        </Form.Item>

        <Form.Item label="Người đại diện" name="representative">
          <Input placeholder="Tên người đại diện" />
        </Form.Item>

        <Form.Item label="Thông tin liên lạc" name="contact">
          <Input placeholder="Email, Số điện thoại..." />
        </Form.Item>

        <Form.Item label="Lĩnh vực/Ngành nghề" name="industry">
          <Input placeholder="Ví dụ: Công nghệ, Bán lẻ, Giáo dục" />
        </Form.Item>

        <Form.Item label="Đường dẫn Website" name="website">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item
          label="Mô tả nghiệp vụ"
          name="description"
          rules={[{ required: true, message: 'Vui lòng mô tả nghiệp vụ' }]}
        >
          <TextArea rows={4} placeholder="Mô tả các sản phẩm, dịch vụ, và quy trình chính" />
        </Form.Item>

        <Form.Item label="Mục tiêu của chatbot" name="goal">
          <Input placeholder="Ví dụ: Chăm sóc khách hàng, Tư vấn bán hàng" />
        </Form.Item>

        {/* ── Dynamic Custom Fields ── */}
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

        {/* ── Add custom field section ── */}
        <Divider dashed style={{ marginTop: 4 }} />
        <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 13 }}>
          Thêm trường mô tả tùy chỉnh (tuỳ chọn)
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
            Tạo thêm mô tả
          </Button>
        </Space.Compact>

        <Button type="primary" onClick={onNext} block size="large">
          Tiếp tục
        </Button>
      </Form>
    </Card>
  );
};
