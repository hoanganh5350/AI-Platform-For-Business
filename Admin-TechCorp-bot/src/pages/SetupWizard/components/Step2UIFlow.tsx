import React from 'react';
import { Form, Input, Button, Card, Select, Typography, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { UIBlockForm } from '../SetupWizard.types';

const { Text } = Typography;
const { TextArea } = Input;

interface Step2UIFlowProps {
  form: FormInstance;
  onBack: () => void;
  onFinish: () => void;
}

export const Step2UIFlow: React.FC<Step2UIFlowProps> = ({ form, onBack, onFinish }) => {
  return (
    <Card
      title="Mô tả luồng màn hình doanh nghiệp của bạn"
      bordered={false}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Thêm các khối chức năng (BlockFlow) để mô tả cách người dùng điều hướng trên website của bạn.
      </Text>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ blocks: [{ name: 'Trang chủ', description: 'Màn hình chính của hệ thống' }] }}
      >
        <Form.List name="blocks">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  size="small"
                  title={`BlockFlow ${index + 1}`}
                  extra={
                    index !== 0 ? (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    ) : null
                  }
                  style={{ marginBottom: 16, border: '1px solid #d9d9d9' }}
                >
                  {/* Tên chức năng */}
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    label="Tên chức năng"
                    rules={[{ required: true, message: 'Vui lòng nhập tên chức năng' }]}
                  >
                    <Input placeholder="Ví dụ: Xem sản phẩm" />
                  </Form.Item>

                  {/* Chức năng cha */}
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.blocks !== currentValues.blocks
                    }
                  >
                    {({ getFieldValue }) => {
                      const blocks = getFieldValue('blocks') || [];
                      const availableParents = blocks
                        .slice(0, index)
                        .map((b: UIBlockForm, i: number) => ({
                          label: b?.name || `Block ${i + 1}`,
                          value: b?.name
                            ? b.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
                            : `node-${i}`,
                        }));

                      return index !== 0 ? (
                        <Form.Item
                          {...restField}
                          name={[name, 'parent']}
                          label="Chức năng cha"
                        >
                          <Select
                            placeholder="Chọn chức năng cha"
                            options={availableParents}
                            allowClear
                          />
                        </Form.Item>
                      ) : (
                        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                          (Đây là block gốc — màn hình chính, không có chức năng cha)
                        </Text>
                      );
                    }}
                  </Form.Item>

                  {/* Mô tả chi tiết */}
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label="Mô tả chi tiết"
                  >
                    <TextArea rows={2} placeholder="Mô tả người dùng làm gì ở đây" />
                  </Form.Item>

                  {/* Đường dẫn tuyệt đối — optional */}
                  <Form.Item
                    {...restField}
                    name={[name, 'absoluteUrl']}
                    label={
                      <span>
                        Đường dẫn tuyệt đối{' '}
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                          (tuỳ chọn — link trực tiếp vào chức năng này)
                        </Text>
                      </span>
                    }
                  >
                    <Input placeholder="https://example.com/products hoặc /products" />
                  </Form.Item>
                </Card>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm chức năng mới
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={onBack}>Quay lại</Button>
          <Button type="primary" onClick={onFinish}>
            Hoàn thành cấu hình
          </Button>
        </Space>
      </Form>
    </Card>
  );
};
