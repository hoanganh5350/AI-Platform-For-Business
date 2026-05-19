import React, { useEffect, useMemo, useState } from 'react';
import {
  Form, Input, Button, Card, Typography, Skeleton, Space, Divider, Empty, Tag,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ShopOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Product {
  id?: string;
  name: string;
  description: string;
  consultingNeed: string;
  url?: string;
}

const makeId = () => `product_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const BusinessProducts: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [businessId, setBusinessId] = useState<string>('');
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const { t } = useTranslation();

  // Watch form values for submittable computation
  const formValues = Form.useWatch('products', form);

  const submittable = useMemo(() => {
    if (!formValues || formValues.length === 0) return false;
    return formValues.every(
      (p: Product) => p?.name?.trim() && p?.description?.trim() && p?.consultingNeed?.trim()
    );
  }, [formValues]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const bid = localStorage.getItem('currentBusinessId');
        if (!bid) return;
        setBusinessId(bid);

        const res = await AdminAPI.getBusinessConfig(bid);
        if (res.success && res.data?.metadata?.products) {
          const saved: Product[] = res.data.metadata.products;
          if (saved.length > 0) {
            form.setFieldsValue({ products: saved });
          } else {
            // Default 1 empty product if none
            form.setFieldsValue({ products: [{ id: makeId(), name: '', description: '', consultingNeed: '', url: '' }] });
          }
        } else {
          form.setFieldsValue({ products: [{ id: makeId(), name: '', description: '', consultingNeed: '', url: '' }] });
        }
      } catch {
        form.setFieldsValue({ products: [{ id: makeId(), name: '', description: '', consultingNeed: '', url: '' }] });
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [form]);

  const handleSave = async (values: { products: Product[] }) => {
    if (!businessId) return;
    setSubmitting(true);
    try {
      // Ensure all products have an ID
      const productsWithIds = values.products.map((p) => ({
        ...p,
        id: p.id || makeId(),
      }));
      
      // Update form values with generated IDs so they persist without reload
      form.setFieldsValue({ products: productsWithIds });

      await AdminAPI.updateBusinessInfoJwt(businessId, {
        metadata: { products: productsWithIds },
      });
      notifySuccess('Lưu thành công!', 'Danh mục sản phẩm đã được cập nhật.');
    } catch {
      notifyError('Lưu thất bại', 'Đã có lỗi khi lưu sản phẩm. Vui lòng thử lại.');
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
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <ShopOutlined style={{ fontSize: 24, color: 'var(--primary)' }} />
          <Title level={3} style={{ margin: 0 }}>
            {t('menu.business_products', 'Danh mục sản phẩm')}
          </Title>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Thêm danh sách sản phẩm / dịch vụ của doanh nghiệp để Chatbot tư vấn chính xác hơn.
        </Text>

        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.length === 0 && (
                  <Empty description="Chưa có sản phẩm nào. Nhấn nút bên dưới để thêm." style={{ marginBottom: 16 }} />
                )}
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}
                    title={
                      <Space>
                        <Tag color="blue">#{index + 1}</Tag>
                        <Text strong>Sản phẩm / Dịch vụ</Text>
                      </Space>
                    }
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    }
                  >
                    {/* Hidden field for ID */}
                    <Form.Item {...restField} name={[name, 'id']} hidden>
                      <Input />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      label="Tên sản phẩm / Dịch vụ"
                      rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                    >
                      <Input placeholder="Ví dụ: Gói tư vấn tài chính cá nhân, Khóa học lập trình..." />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Mô tả sản phẩm"
                      rules={[{ required: true, message: 'Vui lòng mô tả sản phẩm' }]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật, đối tượng phù hợp..."
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'consultingNeed']}
                      label="Nhu cầu tư vấn"
                      rules={[{ required: true, message: 'Vui lòng mô tả nhu cầu tư vấn' }]}
                    >
                      <TextArea
                        rows={2}
                        placeholder="Ví dụ: Khách hàng muốn biết giá, hỏi về điều kiện tham gia, so sánh các gói..."
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'url']}
                      required={false}
                      rules={[
                        {
                          pattern: /^$|^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\/[-a-zA-Z0-9@:%_+.~#?&/=]*)?$/,
                          message: 'Đường dẫn không hợp lệ. Phải bắt đầu bằng http:// hoặc https://',
                        },
                      ]}
                      label={
                        <span>
                          Đường dẫn sản phẩm{' '}
                          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>(tuỳ chọn)</Text>
                        </span>
                      }
                    >
                      <Input placeholder="https://example.com/product-name" />
                    </Form.Item>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({ id: makeId(), name: '', description: '', consultingNeed: '', url: '' })}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 24 }}
                >
                  Thêm sản phẩm / Dịch vụ
                </Button>
              </>
            )}
          </Form.List>

          <Divider />

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SaveOutlined />}
              disabled={!submittable}
            >
              {t('common.save', 'Lưu danh mục')}
            </Button>
          </Space>
        </Form>
      </div>
    </AppThemeProvider>
  );
};
