import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input, Tag, Divider, Select, Card, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { EyeOutlined, UserAddOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface UserRecord {
  _id: string;
  userName: string;
  role: string;
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
  role: string;
}

export const AdminUserView: React.FC = () => {
  const [data, setData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UserRecord | null>(null);
  const [editForm] = Form.useForm();

  const navigate = useNavigate();
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<FilterState>({ search: '', status: '', role: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getAdmins();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      notifyError(t('common.error'), 'Không thể tải danh sách Admin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (record: UserRecord) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      status: record.status,
      email: record.email,
      phone: record.phone,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    try {
      const values = await editForm.validateFields();
      const res = await AdminAPI.requestUpdateUser(editingRecord._id, values);
      if (res.success) {
        const request = res.data;
        notifySuccess(
          'Tạo request thành công',
          `Yêu cầu cập nhật tài khoản "${editingRecord.userName}" đã được ghi nhận. Đang chờ phê duyệt.`,
          () => {
            if (request?.requestId) {
              navigate(`/admin/requests?requestId=${request.requestId}`);
            }
          }
        );
        setIsEditModalVisible(false);
      }
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      notifyError('Lỗi tạo request', e.response?.data?.message || 'Không thể tạo yêu cầu cập nhật.');
    }
  };

  const handleCreateAdmin = async () => {
    setCreateLoading(true);
    try {
      const values = await createForm.validateFields();
      if (values.password !== values.confirmPassword) {
        notifyError('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu xác nhận.');
        return;
      }
      const res = await AdminAPI.createAdminRequest({ userName: values.userName, password: values.password });
      if (res.success) {
        const request = res.data;
        notifySuccess(
          'Gửi yêu cầu thành công!',
          `Tài khoản Admin "${values.userName}" đã được tạo ở trạng thái chờ. ADMIN_SYSTEM sẽ phê duyệt tại màn Quản lý Request.`,
          () => {
            if (request?.requestId) {
              navigate(`/admin/requests?requestId=${request.requestId}`);
            }
          }
        );
        setIsCreateModalVisible(false);
        createForm.resetFields();
      }
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      notifyError('Lỗi tạo tài khoản Admin', e.response?.data?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = !filters.search || item.userName.toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus = !filters.status || item.status === filters.status;
      const matchRole = !filters.role || item.role === filters.role;
      return matchSearch && matchStatus && matchRole;
    });
  }, [data, filters]);

  const handleResetFilters = () => setFilters({ search: '', status: '', role: '' });

  const columns: ColumnsType<UserRecord> = [
    { title: t('admin.username'), dataIndex: 'userName', key: 'userName' },
    {
      title: t('admin.role'),
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'ADMIN_SYSTEM' ? 'red' : 'blue'}>{role}</Tag>,
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
          <Title level={3} style={{ margin: 0 }}>{t('admin.admin_view')}</Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsCreateModalVisible(true)}>
              {t('admin.create_admin')}
            </Button>
          </Space>
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
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                value={filters.role || undefined}
                onChange={(val) => setFilters((f) => ({ ...f, role: val ?? '' }))}
                placeholder={t('admin.filter_role_all')}
                allowClear
              >
                <Select.Option value="ADMIN_SYSTEM"><Tag color="red">ADMIN_SYSTEM</Tag></Select.Option>
                <Select.Option value="ADMIN"><Tag color="blue">ADMIN</Tag></Select.Option>
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

        {/* Edit Modal */}
        <Modal
          title="Cập nhật Admin Account"
          open={isEditModalVisible}
          onOk={handleUpdate}
          onCancel={() => setIsEditModalVisible(false)}
          okText="Tạo Request Update"
        >
          <Form form={editForm} layout="vertical">
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

        {/* Create Admin Modal */}
        <Modal
          title="Tạo tài khoản Admin mới"
          open={isCreateModalVisible}
          onOk={handleCreateAdmin}
          onCancel={() => { setIsCreateModalVisible(false); createForm.resetFields(); }}
          okText="Gửi yêu cầu tạo"
          confirmLoading={createLoading}
        >
          <div style={{ marginBottom: 16, padding: '10px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6 }}>
            <Text style={{ fontSize: 12, color: '#ad6800' }}>
              ⏳ Tài khoản ADMIN sẽ được kích hoạt sau khi <strong>ADMIN_SYSTEM</strong> phê duyệt tại màn Quản lý Request.
            </Text>
          </div>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form form={createForm} layout="vertical">
            <Form.Item label="Tên đăng nhập" name="userName" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}>
              <Input placeholder="Nhập tên đăng nhập cho tài khoản Admin" />
            </Form.Item>
            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự' }]}>
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item label="Xác nhận mật khẩu" name="confirmPassword" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}>
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppThemeProvider>
  );
};
