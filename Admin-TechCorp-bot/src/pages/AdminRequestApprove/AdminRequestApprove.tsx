import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Tag, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import dayjs from 'dayjs';
import { UserRole } from '../../utils/types/user';

const { Title, Text } = Typography;

interface ApprovalRequest {
  _id: string;
  requestId: string;
  action: string;
  targetType: string;
  targetId: {
    userName: string;
  };
  payload: unknown;
  status: string;
  createdBy: string;
  createdAt: string;
}

export const AdminRequestApprove: React.FC = () => {
  const [data, setData] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<ApprovalRequest | null>(null);

  const { notifySuccess, notifyError, notifyWarning, contextHolder } = useAppNotification();
  const currentUserRole = localStorage.getItem('role');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getApprovalRequests();
      if (res.success) {
        setData(res.data);
      }
    } catch {
      notifyError('Lỗi tải dữ liệu', 'Không thể tải danh sách request. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (requestId: string, action: 'APPROVE' | 'REJECT', record: ApprovalRequest) => {
    setActionLoading(`${requestId}-${action}`);
    try {
      const res = await AdminAPI.handleRequest(requestId, action);
      if (res.success) {
        if (action === 'APPROVE') {
          notifySuccess(
            'Phê duyệt thành công',
            `Request ${record.requestId} (${record.targetType}) đã được phê duyệt. Tài khoản "${record.targetId?.userName}" đã được kích hoạt.`
          );
        } else {
          notifyWarning(
            'Đã từ chối',
            `Request ${record.requestId} của "${record.targetId?.userName}" đã bị từ chối.`
          );
        }
        setIsModalVisible(false);
        fetchData();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      notifyError(
        `Lỗi ${action === 'APPROVE' ? 'phê duyệt' : 'từ chối'} request`,
        e.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const canApprove = (record: ApprovalRequest) => {
    if (record.status !== 'Pending') return false;
    if (record.targetType === 'ADMIN' && currentUserRole !== UserRole.ADMIN_SYSTEM) return false;
    if (record.targetType === 'BUSINESS' && !['ADMIN_SYSTEM', 'ADMIN'].includes(currentUserRole as string)) return false;
    return true;
  };

  const columns: ColumnsType<ApprovalRequest> = [
    { title: 'Mã Request', dataIndex: 'requestId', key: 'requestId', width: 160 },
    {
      title: 'Loại',
      dataIndex: 'action',
      key: 'action',
      width: 90,
      render: (val: string) => <Tag color={val === 'CREATE' ? 'blue' : 'orange'}>{val}</Tag>,
    },
    {
      title: 'Đối tượng',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 110,
      render: (val: string) => <Tag color={val === 'ADMIN' ? 'red' : 'cyan'}>{val}</Tag>,
    },
    { title: 'Tài khoản', key: 'targetUserName', render: (_: unknown, record: ApprovalRequest) => record.targetId?.userName || 'N/A' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110,
      render: (val: string) => {
        const map: Record<string, string> = { Approved: 'green', Rejected: 'red', Pending: 'gold' };
        return <Tag color={map[val] || 'default'}>{val}</Tag>;
      },
    },
    { title: 'Người tạo', dataIndex: 'createdBy', key: 'createdBy' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    {
      title: 'Hành động',
      key: 'action',
      width: 220,
      render: (_: unknown, record: ApprovalRequest) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => { setViewingRecord(record); setIsModalVisible(true); }}
          >
            Chi tiết
          </Button>
          {canApprove(record) && (
            <>
              <Popconfirm
                title="Xác nhận phê duyệt?"
                description={`Kích hoạt tài khoản "${record.targetId?.userName}"?`}
                onConfirm={() => handleAction(record._id, 'APPROVE', record)}
                okText="Phê duyệt"
                cancelText="Huỷ"
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={actionLoading === `${record._id}-APPROVE`}
                >
                  Duyệt
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Xác nhận từ chối?"
                description={`Từ chối request của "${record.targetId?.userName}"?`}
                onConfirm={() => handleAction(record._id, 'REJECT', record)}
                okText="Từ chối"
                okButtonProps={{ danger: true }}
                cancelText="Huỷ"
              >
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={actionLoading === `${record._id}-REJECT`}
                >
                  Từ chối
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AppThemeProvider>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Phê duyệt Request</Title>
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>Làm mới</Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} request` }}
        />

        <Modal
          title={`Chi tiết Request — ${viewingRecord?.requestId}`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={
            viewingRecord && canApprove(viewingRecord) ? (
              <Space>
                <Popconfirm
                  title="Xác nhận phê duyệt?"
                  onConfirm={() => viewingRecord && handleAction(viewingRecord._id, 'APPROVE', viewingRecord)}
                  okText="Phê duyệt"
                >
                  <Button type="primary" icon={<CheckCircleOutlined />}>Phê duyệt</Button>
                </Popconfirm>
                <Popconfirm
                  title="Xác nhận từ chối?"
                  onConfirm={() => viewingRecord && handleAction(viewingRecord._id, 'REJECT', viewingRecord)}
                  okText="Từ chối"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<CloseCircleOutlined />}>Từ chối</Button>
                </Popconfirm>
                <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
              </Space>
            ) : (
              <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
            )
          }
          width={560}
        >
          {viewingRecord && (
            <div>
              <p><strong>Mã Request:</strong> {viewingRecord.requestId}</p>
              <p><strong>Loại hành động:</strong> <Tag color={viewingRecord.action === 'CREATE' ? 'blue' : 'orange'}>{viewingRecord.action}</Tag></p>
              <p><strong>Loại đối tượng:</strong> <Tag color={viewingRecord.targetType === 'ADMIN' ? 'red' : 'cyan'}>{viewingRecord.targetType}</Tag></p>
              <p><strong>Tài khoản thay đổi:</strong> {viewingRecord.targetId?.userName}</p>
              <p><strong>Người yêu cầu:</strong> {viewingRecord.createdBy}</p>
              <p><strong>Trạng thái:</strong> <Tag>{viewingRecord.status}</Tag></p>
              <div style={{ marginTop: 16 }}>
                <Text strong>Dữ liệu yêu cầu:</Text>
                <pre style={{ background: 'var(--background)', padding: 12, borderRadius: 4, marginTop: 8, fontSize: 12, overflowX: 'auto' }}>
                  {JSON.stringify(viewingRecord.payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppThemeProvider>
  );
};
