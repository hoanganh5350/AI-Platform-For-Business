import React, { useMemo } from 'react';
import { Form, Input, Button, Card, Select, Typography, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { UIBlockForm } from '../SetupWizard.types';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const { TextArea } = Input;

interface Step2UIFlowProps {
  form: FormInstance;
  onBack: () => void;
  onFinish: () => void;
}

export const Step2UIFlow: React.FC<Step2UIFlowProps> = ({ form, onBack, onFinish }) => {
  const blocks: UIBlockForm[] | undefined = Form.useWatch('blocks', form);
  const { t } = useTranslation();

  // Compute submittable directly from watched values — no timing issues
  const submittable = useMemo(() => {
    if (!blocks || blocks.length === 0) return false;
    return blocks.every(
      (block) => block?.name?.trim() && block?.description?.trim()
    );
  }, [blocks]);

  return (
    <Card
      title={t("setup.step2_title")}
      bordered={false}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
    >
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        {t("setup.step2_desc")}
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
                    label={t("setup.block_name")}
                    rules={[{ required: true, message: 'Vui lòng nhập tên chức năng' }]}
                  >
                    <Input />
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
                          label={t("setup.block_parent")}
                        >
                          <Select
                            options={availableParents}
                            allowClear
                          />
                        </Form.Item>
                      ) : (
                        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                          {t("setup.root_note")}
                        </Text>
                      );
                    }}
                  </Form.Item>

                  {/* Mô tả chi tiết */}
                  <Form.Item
                    {...restField}
                    name={[name, 'description']}
                    label={t("setup.block_desc")}
                    rules={[{ required: true, message: 'Vui lòng mô tả chức năng này' }]}
                  >
                    <TextArea rows={2} />
                  </Form.Item>

                  {/* Đường dẫn tuyệt đối — optional */}
                  <Form.Item
                    {...restField}
                    name={[name, 'absoluteUrl']}
                    required={false}
                    rules={[]}
                    label={
                      <span>
                        {t("setup.block_url")}{' '}
                        <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                          (tuỳ chọn)
                        </Text>
                      </span>
                    }
                  >
                    <Input />
                  </Form.Item>
                </Card>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t("setup.add_block")}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={onBack}>{t("common.back")}</Button>
          <Button type="primary" onClick={onFinish} disabled={!submittable}>
            {t("setup.finish_config")}
          </Button>
        </Space>
      </Form>
    </Card>
  );
};
