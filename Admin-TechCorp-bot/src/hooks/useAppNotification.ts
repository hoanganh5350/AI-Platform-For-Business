import { notification } from 'antd';
import type { NotificationPlacement } from 'antd/es/notification/interface';

const PLACEMENT: NotificationPlacement = 'topRight';
const DURATION = 4; // seconds

export const useAppNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const notifySuccess = (title: string, description?: string) => {
    api.success({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION,
    });
  };

  const notifyError = (title: string, description?: string) => {
    api.error({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION + 2,
    });
  };

  const notifyWarning = (title: string, description?: string) => {
    api.warning({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION,
    });
  };

  const notifyInfo = (title: string, description?: string) => {
    api.info({
      message: title,
      description,
      placement: PLACEMENT,
      duration: DURATION,
    });
  };

  return { notifySuccess, notifyError, notifyWarning, notifyInfo, contextHolder };
};
