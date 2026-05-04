import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Skeleton, Select, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import type { BusinessConfig, UIFlowNode } from '../../api/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface UIBlockForm {
  name: string;
  parent?: string;
  description?: string;
  /** Absolute URL / deeplink entered by admin */
  absoluteUrl?: string;
  _id?: string;
}

export const UIFlowConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [config, setConfig] = useState<BusinessConfig | null>(null);

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

        // Flatten the tree for Form.List — now preserving absoluteUrl
        const flatBlocks: UIBlockForm[] = [];
        const flatten = (nodes: UIFlowNode[], parentId?: string) => {
          nodes.forEach((node) => {
            // Determine if the stored url is a real absolute url (not auto-generated)
            const storedUrl = node.url || '';
            const autoUrl = `/${node.id}`;
            const absoluteUrl = storedUrl && storedUrl !== autoUrl ? storedUrl : '';

            flatBlocks.push({
              _id: node.id,
              name: node.name || node.id,
              description: node.description,
              absoluteUrl,
              parent: parentId,
            });
            if (node.children && node.children.length > 0) {
              flatten(node.children, node.id);
            }
          });
        };

        if (res.data.uiFlowTree && res.data.uiFlowTree.length > 0) {
          flatten(res.data.uiFlowTree);
        } else {
          flatBlocks.push({ name: 'Trang chủ', description: 'Màn hình chính của hệ thống', _id: 'trang-chu' });
        }

        form.setFieldsValue({ blocks: flatBlocks });
      }
    } catch {
      message.error('Lỗi khi tải cấu hình UI Flow');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (values: { blocks: UIBlockForm[] }) => {
    if (!config) return;
    setSubmitting(true);
    try {
      const blocks: UIBlockForm[] = values.blocks || [];

      const nodeMap: Record<string, UIFlowNode> = {};
      const tree: UIFlowNode[] = [];

      // Pass 1: Create nodes — use absoluteUrl if provided, otherwise auto-generate
      blocks.forEach((block, index) => {
        const id =
          block._id ||
          (block.name ? block.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : `node-${index}`);
        const url = block.absoluteUrl?.trim() || `/${id}`;
        nodeMap[id] = {
          id,
          name: block.name,
          description: block.description,
          actionType: 'navigate',
          url,
          children: [],
        };
        block._id = id;
      });

      // Pass 2: Build Tree
      blocks.forEach((block) => {
        const node = nodeMap[block._id!];
        if (block.parent && nodeMap[block.parent]) {
          node.parentId = block.parent;
          nodeMap[block.parent].children!.push(node);
        } else {
          tree.push(node);
        }
      });

      await AdminAPI.updateUIFlow(config.businessId, tree);

      message.success('Đã lưu cấu hình Luồng Màn hình thành công!');
      loadData();
    } catch {
      message.error('Lỗi khi lưu cấu hình');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 24 }}><Skeleton active /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Title level={3} style={{ marginBottom: 8 }}>Luồng Màn hình (UI Flow)</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
        Quản lý các khối chức năng (BlockFlow) để mô tả cách người dùng điều hướng trên website của bạn.
      </Text>

      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: 'calc(100% - 80px)' }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
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
                    {/* Hidden field for ID persistence during edit */}
                    <Form.Item {...restField} name={[name, '_id']} style={{ display: 'none' }}>
                      <Input />
                    </Form.Item>

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
                            value:
                              b?._id ||
                              (b?.name
                                ? b.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
                                : `node-${i}`),
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

          <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
              Lưu thay đổi
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};
