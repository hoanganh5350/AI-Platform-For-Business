import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;

interface UserRecord {
  _id: string;
  userName: string;
  businessId?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export const AdminBusinessView: React.FC = () => {
  const [data, setData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UserRecord | null>(null);
  const [form] = Form.useForm();
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getBusinesses();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      notifyError('Lỗi tải dữ liệu', 'Không thể tải danh sách Business. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (record: UserRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({ status: record.status });
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

  const columns: ColumnsType<UserRecord> = [
    { title: 'Tên đăng nhập', dataIndex: 'userName', key: 'userName' },
    { title: 'Business ID', dataIndex: 'businessId', key: 'businessId' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
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
        <Title level={3} style={{ marginBottom: 24 }}>Quản lý Account Business</Title>
        <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} />

        <Modal title="Cập nhật Business Account" open={isModalVisible} onOk={handleUpdate} onCancel={() => setIsModalVisible(false)} okText="Tạo Request Update">
          <Form form={form} layout="vertical">
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
              <Input placeholder="Active hoặc Inactive" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppThemeProvider>
  );
};
