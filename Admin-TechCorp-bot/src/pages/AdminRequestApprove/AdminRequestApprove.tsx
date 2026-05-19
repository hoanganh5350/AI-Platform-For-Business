import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Space, Typography, Modal, Tag, Popconfirm, Descriptions, Card, Row, Col, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import dayjs from 'dayjs';
import { UserRole } from '../../utils/types/user';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

interface ApprovalRequest {
  _id: string;
  requestId: string;
  action: string;
  targetType: string;
  targetId: {
    userName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Record<string, any>;
  status: string;
  createdBy: string;
  createdAt: string;
}

// Map field keys -> Vietnamese label
const FIELD_LABELS: Record<string, string> = {
  userName: 'Tên đăng nhập',
  password: 'Mật khẩu',
  role: 'Vai trò',
  status: 'Trạng thái',
  email: 'Email',
  phone: 'Số điện thoại',
  businessName: 'Tên doanh nghiệp',
  businessId: 'Business ID',
  industry: 'Ngành nghề',
  website: 'Website',
  description: 'Mô tả',
  goal: 'Mục tiêu',
  tone: 'Giọng văn',
  chatbotName: 'Tên Chatbot',
  welcomeMessage: 'Lời chào',
  language: 'Ngôn ngữ',
};

const EXCLUDED_FIELDS = ['_id', '__v', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy'];

const renderFieldValue = (key: string, value: unknown): React.ReactNode => {
  if (value === null || value === undefined || value === '') return <Text type="secondary" style={{ fontStyle: 'italic' }}>Chưa có</Text>;
  if (key === 'status') {
    const color = value === 'Active' ? 'green' : 'default';
    return <Tag color={color}>{String(value)}</Tag>;
  }
  if (key === 'role') {
    const color = value === 'ADMIN_SYSTEM' ? 'red' : value === 'ADMIN' ? 'blue' : 'cyan';
    return <Tag color={color}>{String(value)}</Tag>;
  }
  if (key === 'password') return <Text type="secondary">••••••••</Text>;
  return <Text>{String(value)}</Text>;
};

interface DataCompareTableProps {
  payload: Record<string, unknown>;
  oldData?: Record<string, unknown>;
  isUpdate: boolean;
}

const DataCompareTable: React.FC<DataCompareTableProps> = ({ payload, oldData, isUpdate }) => {
  const keys = Object.keys(payload).filter(k => !EXCLUDED_FIELDS.includes(k));

  if (keys.length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isUpdate ? '150px 1fr 1fr' : '150px 1fr',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--border-color, #f0f0f0)',
          fontSize: 13,
        }}
      >
        {/* Header */}
        <div style={{ padding: '9px 12px', fontWeight: 700, background: 'var(--component-background, #fafafa)', borderBottom: '1px solid var(--border-color, #f0f0f0)' }}>
          Trường
        </div>
        {isUpdate && (
          <div style={{ padding: '9px 12px', fontWeight: 700, background: '#fff1f0', borderBottom: '1px solid #ffa39e', borderLeft: '1px solid var(--border-color, #f0f0f0)', color: '#cf1322' }}>
            ⬅ Giá trị cũ
          </div>
        )}
        <div style={{ padding: '9px 12px', fontWeight: 700, background: '#f6ffed', borderBottom: '1px solid #b7eb8f', borderLeft: '1px solid var(--border-color, #f0f0f0)', color: '#389e0d' }}>
          {isUpdate ? '➡ Giá trị mới' : '✚ Giá trị tạo mới'}
        </div>

        {/* Rows */}
        {keys.map((key, idx) => {
          const newVal = payload[key];
          const oldVal = oldData?.[key];
          const changed = isUpdate && JSON.stringify(oldVal) !== JSON.stringify(newVal);
          const isLast = idx === keys.length - 1;
          const cellBorder = isLast ? 'none' : '1px solid var(--border-color, #f0f0f0)';

          return (
            <React.Fragment key={key}>
              {/* Label cell */}
              <div style={{
                padding: '9px 12px',
                background: 'var(--component-background, #fafafa)',
                borderBottom: cellBorder,
                fontWeight: 500,
                color: 'var(--text-color-secondary, #888)',
              }}>
                {FIELD_LABELS[key] ?? key}
              </div>

              {/* Old value cell */}
              {isUpdate && (
                <div style={{
                  padding: '9px 12px',
                  background: changed ? '#fff4f4' : 'transparent',
                  borderBottom: cellBorder,
                  borderLeft: '1px solid var(--border-color, #f0f0f0)',
                  textDecoration: changed ? 'line-through' : 'none',
                  opacity: changed ? 0.65 : 1,
                }}>
                  {renderFieldValue(key, oldVal)}
                </div>
              )}

              {/* New value cell */}
              <div style={{
                padding: '9px 12px',
                background: changed ? '#f0fff4' : 'transparent',
                borderBottom: cellBorder,
                borderLeft: '1px solid var(--border-color, #f0f0f0)',
                fontWeight: changed ? 600 : 400,
              }}>
                {renderFieldValue(key, newVal)}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const AdminRequestApprove: React.FC = () => {
  const [data, setData] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<ApprovalRequest | null>(null);

  const { notifySuccess, notifyError, notifyWarning, contextHolder } = useAppNotification();
  const currentUserRole = localStorage.getItem('role');
  const { t } = useTranslation();

  const [filters, setFilters] = useState({ search: '', status: '', action: '', targetType: '' });

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch = !filters.search || item.targetId?.userName?.toLowerCase().includes(filters.search.toLowerCase()) || item.requestId?.toLowerCase().includes(filters.search.toLowerCase());
      const matchStatus = !filters.status || item.status === filters.status;
      const matchAction = !filters.action || item.action === filters.action;
      const matchTarget = !filters.targetType || item.targetType === filters.targetType;
      return matchSearch && matchStatus && matchAction && matchTarget;
    });
  }, [data, filters]);

  const handleResetFilters = () => setFilters({ search: '', status: '', action: '', targetType: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getApprovalRequests();
      if (res.success) {
        setData(res.data);
      }
    } catch {
      notifyError(t("common.error"), 'Không thể tải danh sách request. Vui lòng thử lại.');
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
      title: t("admin.type"),
      dataIndex: 'action',
      key: 'action',
      width: 90,
      render: (val: string) => <Tag color={val === 'CREATE' ? 'blue' : 'orange'}>{val}</Tag>,
    },
    {
      title: t("admin.target"),
      dataIndex: 'targetType',
      key: 'targetType',
      width: 110,
      render: (val: string) => <Tag color={val === 'ADMIN' ? 'red' : 'cyan'}>{val}</Tag>,
    },
    { title: 'Tài khoản', key: 'targetUserName', render: (_: unknown, record: ApprovalRequest) => record.targetId?.userName || 'N/A' },
    {
      title: t("common.status"), dataIndex: 'status', key: 'status', width: 110,
      render: (val: string) => {
        const map: Record<string, string> = { Approved: 'green', Rejected: 'red', Pending: 'gold' };
        return <Tag color={map[val] || 'default'}>{val}</Tag>;
      },
    },
    { title: 'Người tạo', dataIndex: 'createdBy', key: 'createdBy' },
    { title: t("admin.created_at"), dataIndex: 'createdAt', key: 'createdAt', render: (val: string) => dayjs(val).format('DD/MM/YYYY HH:mm') },
    {
      title: t("common.action"),
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
        </Space>
      ),
    },
  ];

  const payload = viewingRecord?.payload as Record<string, unknown> | undefined;
  const oldData = viewingRecord?.targetId as Record<string, unknown> | undefined;
  const isUpdate = viewingRecord?.action === 'UPDATE';

  return (
    <AppThemeProvider>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>{t("admin.requests_view")}</Title>
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
                <Select.Option value="Pending"><Tag color="gold">Pending</Tag></Select.Option>
                <Select.Option value="Approved"><Tag color="green">Approved</Tag></Select.Option>
                <Select.Option value="Rejected"><Tag color="red">Rejected</Tag></Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                value={filters.action || undefined}
                onChange={(val) => setFilters((f) => ({ ...f, action: val ?? '' }))}
                placeholder={t('admin.filter_action_all')}
                allowClear
              >
                <Select.Option value="CREATE"><Tag color="blue">CREATE</Tag></Select.Option>
                <Select.Option value="UPDATE"><Tag color="orange">UPDATE</Tag></Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                value={filters.targetType || undefined}
                onChange={(val) => setFilters((f) => ({ ...f, targetType: val ?? '' }))}
                placeholder={t('admin.filter_target_all')}
                allowClear
              >
                <Select.Option value="ADMIN"><Tag color="red">ADMIN</Tag></Select.Option>
                <Select.Option value="BUSINESS"><Tag color="cyan">BUSINESS</Tag></Select.Option>
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
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} request` }}
        />

        <Modal
          title={`Chi tiết Request — ${viewingRecord?.requestId}`}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          styles={{
            footer: { paddingTop: '18px' },
            content: { padding: '24px' },
            body: { padding: '24px 0' }
          }}
          footer={
            viewingRecord && canApprove(viewingRecord) ? (
              <Space>
                <Popconfirm
                  title="Xác nhận phê duyệt?"
                  description={`Phê duyệt request của "${viewingRecord.targetId?.userName}"?`}
                  onConfirm={() => viewingRecord && handleAction(viewingRecord._id, 'APPROVE', viewingRecord)}
                  okText="Phê duyệt"
                  cancelText="Huỷ"
                >
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={actionLoading === `${viewingRecord._id}-APPROVE`}
                  >
                    Phê duyệt
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="Xác nhận từ chối?"
                  description={`Từ chối request của "${viewingRecord.targetId?.userName}"?`}
                  onConfirm={() => viewingRecord && handleAction(viewingRecord._id, 'REJECT', viewingRecord)}
                  okText="Từ chối"
                  okButtonProps={{ danger: true }}
                  cancelText="Huỷ"
                >
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    loading={actionLoading === `${viewingRecord._id}-REJECT`}
                  >
                    Từ chối
                  </Button>
                </Popconfirm>
                <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
              </Space>
            ) : (
              <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>
            )
          }
          width={700}
        >
          {viewingRecord && (
            <div>
              {/* Summary Info */}
              <Descriptions size="small" column={1} bordered style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Mã Request">{viewingRecord.requestId}</Descriptions.Item>
                <Descriptions.Item label="Loại hành động">
                  <Tag color={viewingRecord.action === 'CREATE' ? 'blue' : 'orange'}>{viewingRecord.action}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Loại đối tượng">
                  <Tag color={viewingRecord.targetType === 'ADMIN' ? 'red' : 'cyan'}>{viewingRecord.targetType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tài khoản">{viewingRecord.targetId?.userName || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Người yêu cầu">{viewingRecord.createdBy}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {(() => {
                    const map: Record<string, string> = { Approved: 'green', Rejected: 'red', Pending: 'gold' };
                    return <Tag color={map[viewingRecord.status] || 'default'}>{viewingRecord.status}</Tag>;
                  })()}
                </Descriptions.Item>
              </Descriptions>

              {/* Data comparison */}
              {payload && Object.keys(payload).filter(k => !EXCLUDED_FIELDS.includes(k)).length > 0 && (
                <>
                  <Text strong style={{ fontSize: 13 }}>
                    {isUpdate ? '📋 So sánh thay đổi:' : '📋 Thông tin tạo mới:'}
                  </Text>
                  <DataCompareTable
                    payload={payload}
                    oldData={isUpdate ? oldData : undefined}
                    isUpdate={isUpdate}
                  />
                </>
              )}
            </div>
          )}
        </Modal>
      </div>
    </AppThemeProvider>
  );
};
