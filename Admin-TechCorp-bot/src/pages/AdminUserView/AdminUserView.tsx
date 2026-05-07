import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input, Tag, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { EyeOutlined, UserAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface UserRecord {
  _id: string;
  userName: string;
  role: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export const AdminUserView: React.FC = () => {
  const [data, setData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UserRecord | null>(null);
  const [editForm] = Form.useForm();

  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getAdmins();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      notifyError('Lỗi tải dữ liệu', 'Không thể tải danh sách Admin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (record: UserRecord) => {
    setEditingRecord(record);
    editForm.setFieldsValue({ status: record.status });
    setIsEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    try {
      const values = await editForm.validateFields();
      const res = await AdminAPI.requestUpdateUser(editingRecord._id, values);
      if (res.success) {
        notifySuccess('Tạo request thành công', `Yêu cầu cập nhật tài khoản "${editingRecord.userName}" đã được ghi nhận. Đang chờ phê duyệt.`);
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
        notifySuccess(
          'Gửi yêu cầu thành công!',
          `Tài khoản Admin "${values.userName}" đã được tạo ở trạng thái chờ. ADMIN_SYSTEM sẽ phê duyệt tại màn Quản lý Request.`
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

  const columns: ColumnsType<UserRecord> = [
    { title: 'Tên đăng nhập', dataIndex: 'userName', key: 'userName' },
    {
      title: 'Vai trò', dataIndex: 'role', key: 'role',
      render: (role: string) => <Tag color={role === 'ADMIN_SYSTEM' ? 'red' : 'blue'}>{role}</Tag>,
    },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status',
      render: (status: string) => <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>,
    },
    { title: 'Người tạo', dataIndex: 'createdBy', key: 'createdBy' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    { title: 'Người cập nhật', dataIndex: 'updatedBy', key: 'updatedBy' },
    { title: 'Ngày cập nhật', dataIndex: 'updatedAt', key: 'updatedAt', render: (val: string) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: UserRecord) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small" onClick={() => handleEdit(record)}>Xem / Sửa</Button>
        </Space>
      ),
    },
  ];

  return (
    <AppThemeProvider>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Quản lý Account Admin</Title>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            Tạo tài khoản Admin
          </Button>
        </div>

        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />

        {/* Edit Modal */}
        <Modal
          title="Cập nhật Admin Account"
          open={isEditModalVisible}
          onOk={handleUpdate}
          onCancel={() => setIsEditModalVisible(false)}
          okText="Tạo Request Update"
        >
          <Form form={editForm} layout="vertical">
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
              <Input placeholder="Active hoặc Inactive" />
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
