import React, { useMemo } from 'react';
import { Badge, Popover, List, Button, Empty, Tag, Typography } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useAdminNotifications, AdminNotification } from '../../hooks/useAdminNotifications';
import { AppThemeProvider } from '../AppThemeProvider/AppThemeProvider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import styles from '../Header/Header.module.scss';
import { useNavigate } from 'react-router-dom';
import { useAppNotification } from '../../hooks/useAppNotification';

dayjs.extend(relativeTime);

interface NotificationBellProps {
  role: string | null;
}

const actionTypeLabel = (action: string, targetType: string) => {
  if (action === 'CREATE' && targetType === 'BUSINESS') return { text: 'Đăng ký mới', color: 'blue' };
  if (action === 'CREATE' && targetType === 'ADMIN') return { text: 'Tạo Admin', color: 'purple' };
  if (action === 'UPDATE') return { text: 'Cập nhật', color: 'orange' };
  return { text: action, color: 'default' };
};

const NotificationItem: React.FC<{ item: AdminNotification }> = ({ item }) => {
  const { text, color } = actionTypeLabel(item.action, item.targetType);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Tag color={color} style={{ margin: 0, fontSize: 11 }}>{text}</Tag>
        {!item.read && (
          <span style={{
            display: 'inline-block',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#f5222d',
            flexShrink: 0
          }} />
        )}
      </div>
      <Typography.Text style={{ fontSize: 13, lineHeight: '1.4' }}>{item.message}</Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
        {dayjs(item.timestamp).fromNow()}
      </Typography.Text>
    </div>
  );
};

export const NotificationBell: React.FC<NotificationBellProps> = ({ role }) => {
  const navigate = useNavigate();
  const { notifyInfo, contextHolder } = useAppNotification();
  
  const { notifications, hasUnread, unreadCount, markAllRead, markSingleRead } = useAdminNotifications(role, (requestId, message) => {
    notifyInfo('Yêu cầu phê duyệt mới', message, () => {
      navigate(`/admin/requests?requestId=${requestId}`);
    });
  });

  const content = useMemo(() => (
    <div style={{ width: 320, maxHeight: 420, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px' }}>
        <Typography.Text strong style={{ fontSize: 14 }}>
          Thông báo {unreadCount > 0 && <Tag color="red" style={{ marginLeft: 4 }}>{unreadCount} mới</Tag>}
        </Typography.Text>
        {hasUnread && (
          <Button
            size="small"
            icon={<CheckOutlined />}
            onClick={markAllRead}
            type="link"
            style={{ fontSize: 12, padding: '6px 8px' }}
          >
            Đọc hết
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '24px 0' }} />
      ) : (
        <List
          size="small"
          dataSource={notifications}
          style={{padding:"6px", background:"var(--background)", borderRadius: "8px", maxHeight: 300, overflowY: "auto"}}
          renderItem={(item: AdminNotification) => (
            <List.Item
              style={{
                padding: '4px 6px',
                background: '#fff',
                borderRadius: 6,
                marginBottom: 6,
                cursor: 'pointer',
              }}
              onClick={() => {
                markSingleRead(item.requestId);
                navigate(`/admin/requests?requestId=${item.requestId}`);
              }}
            >
              <NotificationItem item={item} />
            </List.Item>
          )}
        />
      )}
    </div>
  ), [notifications, hasUnread, unreadCount, markAllRead, markSingleRead, navigate]);

  return (
    <AppThemeProvider>
      {contextHolder}
      <Popover
        content={content}
        trigger="click"
        placement="bottomLeft"
        arrow={false}
      >
        <div className={styles.labelPopover}>
          <div className={styles.iconHeader} style={{ position: 'relative' }}>
            <Badge dot={hasUnread} offset={[2, -2]} color="#f5222d">
              <BellOutlined style={{ fontSize: 16 }} />
            </Badge>
          </div>
        </div>
      </Popover>
    </AppThemeProvider>
  );
};
