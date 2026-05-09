import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input, Tag, Select, Card, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { EyeOutlined, EyeInvisibleOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title } = Typography;

interface UserRecord {
  _id: string;
  userName: string;
  businessId?: string;
  email?: string;
  phone?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface FilterState {
  search: string;
  status: string;
}

const MaskedText: React.FC<{ text?: string }> = ({ text }) => {
  const [visible, setVisible] = useState(false);
  if (!text) return null;
  return (
    <Space>
      <span>{visible ? text : '••••••••'}</span>
      <Button
        type="text"
        icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        onClick={() => setVisible(!visible)}
        size="small"
      />
    </Space>
  );
};

export const AdminBusinessView: React.FC = () => {
  const [data, setData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UserRecord | null>(null);
  const [form] = Form.useForm();
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<FilterState>({ search: '', status: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getBusinesses();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      notifyError(t('common.error'), 'Không thể tải danh sách Business. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (record: UserRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      status: record.status,
      email: record.email,
      phone: record.phone,
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    try {
      const values = await form.validateFields();
      const res = await AdminAPI.requestUpdateUser(editingRecord._id, values);
      if (res.success) {
        notifySuccess('Tạo request thành công', `Yêu cầu cập nhật tài khoản "${editingRecord.userName}" đã được ghi nhận. Đang chờ phê duyệt từ quản trị viên.`);
        setIsModalVisible(false);
      }
    } catch (err) {
      console.error(err);
      notifyError('Lỗi tạo request', 'Không thể gửi yêu cầu cập nhật.');
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = !filters.search || item.userName.toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus = !filters.status || item.status === filters.status;
      return matchSearch && matchStatus;
    });
  }, [data, filters]);

  const handleResetFilters = () => setFilters({ search: '', status: '' });

  const columns: ColumnsType<UserRecord> = [
    { title: t('admin.username'), dataIndex: 'userName', key: 'userName' },
    {
      title: t('admin.business_id'),
      dataIndex: 'businessId',
      key: 'businessId',
      render: (text: string) => <MaskedText text={text} />,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>,
    },
    { title: t('admin.email'), dataIndex: 'email', key: 'email', render: (val: string) => val || '' },
    { title: t('admin.phone'), dataIndex: 'phone', key: 'phone', render: (val: string) => val || '' },
    { title: 'Người tạo', dataIndex: 'createdBy', key: 'createdBy' },
    { title: t('admin.created_at'), dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    { title: 'Người cập nhật', dataIndex: 'updatedBy', key: 'updatedBy' },
    { title: 'Ngày cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '' },
    {
      title: t('common.action'),
      key: 'action',
      render: (_: unknown, record: UserRecord) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleEdit(record)}>{t('common.edit')}</Button>
        </Space>
      ),
    },
  ];

  return (
    <AppThemeProvider>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>{t('admin.business_view')}</Title>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
        </div>

        {/* Filter Bar */}
        <Card title={t('admin.filter_title')} size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('admin.filter_placeholder_search')}
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                value={filters.status || undefined}
                onChange={(val) => setFilters((f) => ({ ...f, status: val ?? '' }))}
                placeholder={t('admin.filter_status_all')}
                allowClear
              >
                <Select.Option value="Active"><Tag color="green">Active</Tag></Select.Option>
                <Select.Option value="Inactive"><Tag color="default">Inactive</Tag></Select.Option>
              </Select>
            </Col>
          </Row>
          <Row justify="end" style={{ marginTop: 16 }}>
            <Col>
              <Button onClick={handleResetFilters}>{t('admin.filter_reset')}</Button>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} tài khoản` }}
        />

        <Modal
          title="Cập nhật Business Account"
          open={isModalVisible}
          onOk={handleUpdate}
          onCancel={() => setIsModalVisible(false)}
          okText="Tạo Request Update"
        >
          <Form form={form} layout="vertical">
            <Form.Item label={t('admin.filter_status')} name="status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Active">Active</Select.Option>
                <Select.Option value="Inactive">Inactive</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={t('admin.email')} name="email">
              <Input placeholder="Nhập email" type="email" />
            </Form.Item>
            <Form.Item label={t('admin.phone')} name="phone">
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppThemeProvider>
  );
};
