import { Option, SelectPopover } from "../SelectPopover/SelectPopover";
import styles from "./Header.module.scss";
import {
  UserOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import VNFlag from "./../../assets/VNFlag.svg";
import USFlag from "./../../assets/USFlag.svg";
import { useState, useEffect } from "react";
import { useGetThemeSystem } from "../../hook/useGetThemeSystem";
import { useTranslation } from "react-i18next";
import { Modal, Form, Input, Descriptions, message } from 'antd';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from "../AppThemeProvider/AppThemeProvider";
import { NotificationBell } from "../NotificationBell/NotificationBell";


const optionLang = [
  {
    label: (
      <div className={styles.optionLang}>
        <img src={USFlag} alt="Flag" /> English
      </div>
    ),
    value: "en",
  },
  {
    label: (
      <div className={styles.optionLang}>
        <img src={VNFlag} alt="Flag" /> Tiếng Việt
      </div>
    ),
    value: "vn",
  },
];

const optionTheme = [
  {
    label: (
      <div className={styles.optionLang}>
        <SunOutlined /> Light
      </div>
    ),
    value: "light",
  },
  {
    label: (
      <div className={styles.optionLang}>
        <MoonOutlined /> Dark
      </div>
    ),
    value: "dark",
  },
];

export const Extend = () => {
  const { theme, setTheme } = useGetThemeSystem();
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "en");
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'));

  useEffect(() => {
    // Re-read role from localStorage when it might change (login/logout)
    const syncRole = () => setRole(localStorage.getItem('role'));
    window.addEventListener('storage', syncRole);
    return () => window.removeEventListener('storage', syncRole);
  }, []);

  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userInfo, setUserInfo] = useState<any>(null);
  const [passwordForm] = Form.useForm();
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => setLang(lng);
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const userOptions = [
    {
      label: t("header.profile", "Thông tin cá nhân"),
      value: "profile",
    },
    {
      label: t("header.change_password", "Đổi mật khẩu"),
      value: "change_password",
    },
    {
      label: t("header.logout", "Đăng xuất"),
      value: "logout",
    },
  ];

  const handleUserSelect = async (e: Option) => {
    if (e.value === 'logout') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('currentBusinessId');
      window.location.href = '/login';
    } else if (e.value === 'profile') {
      try {
        const res = await AdminAPI.getCurrentUser();
        if (res.success) {
          setUserInfo(res.data);
          setIsProfileModalVisible(true);
        }
      } catch {
        message.error(t("common.error"));
      }
    } else if (e.value === 'change_password') {
      setIsChangePasswordModalVisible(true);
    }
  };

  return (
    <div className={styles.containerExtend}>
      <SelectPopover
        label={
          <div className={styles.iconHeader}>
            <img src={lang.includes("en") ? USFlag : VNFlag} alt="Flag" />
          </div>
        }
        onSelect={(e) => {
          const newLang = e.value as string === "vn" ? "vi" : "en";
          i18n.changeLanguage(newLang);
        }}
        options={optionLang}
      />
      <SelectPopover
        label={
          <div className={styles.iconHeader}>
            {theme === "light" ? <SunOutlined /> : <MoonOutlined />}
          </div>
        }
        onSelect={(e) => setTheme(e.value as "light" | "dark")}
        options={optionTheme}
      />
      {(role === 'ADMIN' || role === 'ADMIN_SYSTEM') && (
        <NotificationBell role={role} />
      )}
      <SelectPopover
        label={
          <div className={styles.iconHeader}>
            <UserOutlined />
          </div>
        }
        options={userOptions}
        onSelect={handleUserSelect}
      />

      <AppThemeProvider>
        <Modal
          title={t("header.profile", "Thông tin cá nhân")}
          open={isProfileModalVisible}
          onCancel={() => setIsProfileModalVisible(false)}
          footer={null}
        >
          {userInfo && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t("admin.username")}>{userInfo.userName}</Descriptions.Item>
              <Descriptions.Item label={t("admin.role")}>{userInfo.role}</Descriptions.Item>
              <Descriptions.Item label={t("admin.email", "Email")}>{userInfo.email || t("common.not_updated", "Chưa cập nhật")}</Descriptions.Item>
              <Descriptions.Item label={t("admin.phone", "Số điện thoại")}>{userInfo.phone || t("common.not_updated", "Chưa cập nhật")}</Descriptions.Item>
              {userInfo.businessId && (
                <Descriptions.Item label={t("admin.business_id")}>{userInfo.businessId}</Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>

        <Modal
          title={t("header.change_password", "Đổi mật khẩu")}
          open={isChangePasswordModalVisible}
          onCancel={() => {
            setIsChangePasswordModalVisible(false);
            passwordForm.resetFields();
          }}
          onOk={() => passwordForm.submit()}
          confirmLoading={passwordLoading}
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={async (values) => {
              if (values.newPassword !== values.confirmNewPassword) {
                message.error(t("header.password_not_match"));
                return;
              }
              setPasswordLoading(true);
              try {
                const res = await AdminAPI.changePassword({
                  currentPassword: values.currentPassword,
                  newPassword: values.newPassword,
                });
                if (res.success) {
                  message.success(t("header.change_password_success"));
                  setIsChangePasswordModalVisible(false);
                  passwordForm.resetFields();
                }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err: any) {
                message.error(err.response?.data?.message || t("common.error"));
              } finally {
                setPasswordLoading(false);
              }
            }}
          >
            <Form.Item
              label={t("header.current_password")}
              name="currentPassword"
              rules={[{ required: true, message: t("header.current_password") }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label={t("header.new_password")}
              name="newPassword"
              rules={[{ required: true, min: 6, message: t("login.req_password_min") }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label={t("header.confirm_new_password")}
              name="confirmNewPassword"
              rules={[{ required: true, message: t("header.confirm_new_password") }]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>
      </AppThemeProvider>
    </div>
  );
};
