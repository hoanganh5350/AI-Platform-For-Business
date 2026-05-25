import { notification } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';

const PLACEMENT: NotificationPlacement = 'topRight';
const DURATION = 4; // seconds

export const useAppNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const notifySuccess = (title: string, description?: string, onClick?: () => void) => {
    api.success({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION,
      onClick,
      style: onClick ? { cursor: 'pointer' } : undefined,
    });
  };

  const notifyError = (title: string, description?: string, onClick?: () => void) => {
    api.error({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION + 2,
      onClick,
      style: onClick ? { cursor: 'pointer' } : undefined,
    });
  };

  const notifyWarning = (title: string, description?: string, onClick?: () => void) => {
    api.warning({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION,
      onClick,
      style: onClick ? { cursor: 'pointer' } : undefined,
    });
  };

  const notifyInfo = (title: string, description?: string, onClick?: () => void) => {
    api.info({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION,
      onClick,
      style: onClick ? { cursor: 'pointer' } : undefined,
    });
  };

  return { notifySuccess, notifyError, notifyWarning, notifyInfo, contextHolder };
};
