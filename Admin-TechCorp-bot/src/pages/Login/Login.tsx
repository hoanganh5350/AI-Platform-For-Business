import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Tabs, Result } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AdminAPI } from '../../api/client';
import { ROUTES } from '../../router/constants';
import { UserRole } from '../../utils/types/user';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const { notifySuccess, notifyError, contextHolder } = useAppNotification();
  const { t } = useTranslation();

  const handleLogin = async (values: Record<string, unknown>) => {
    setLoginLoading(true);
    try {
      const res = await AdminAPI.login(values);
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.user.role);

        notifySuccess('Đăng nhập thành công', `Chào mừng trở lại, ${res.data.user.userName}!`);

        if (res.data.user.role === UserRole.ADMIN_SYSTEM || res.data.user.role === UserRole.ADMIN) {
          navigate(ROUTES.ADMIN_DASHBOARD);
        } else {
          try {
            const configRes = await AdminAPI.getMyConfig();
            if (configRes.success && configRes.data?.businessId) {
              localStorage.setItem('currentBusinessId', configRes.data.businessId);
              navigate(ROUTES.BUSINESS_INFO);
            } else {
              navigate(ROUTES.DASHBOARD);
            }
          } catch {
            navigate(ROUTES.DASHBOARD);
          }
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      notifyError('Đăng nhập thất bại', e.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values: { userName: string; password: string; confirmPassword: string; businessName: string }) => {
    if (values.password !== values.confirmPassword) {
      notifyError('Mật khẩu không khớp', 'Vui lòng nhập lại mật khẩu xác nhận.');
      return;
    }
    setRegisterLoading(true);
    try {
      const res = await AdminAPI.registerBusiness({
        userName: values.userName,
        password: values.password,
        businessName: values.businessName,
      });
      if (res.success) {
        setRegisterSuccess(true);
        registerForm.resetFields();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      notifyError('Đăng ký thất bại', e.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const loginTab = (
    <Form form={loginForm} layout="vertical" onFinish={handleLogin} style={{ marginTop: 8 }}>
      <Form.Item name="userName" rules={[{ required: true, message: t("login.req_username") }]}>
        <Input size="large" prefix={<UserOutlined style={{ color: '#bbb' }} />} placeholder={t("login.username")} />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: t("login.req_password") }]}>
        <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder={t("login.password")} />
      </Form.Item>
      <Button type="primary" htmlType="submit" size="large" block loading={loginLoading} style={{ marginTop: 4 }}>
        {t("login.login_btn")}
      </Button>
    </Form>
  );

  const registerTab = registerSuccess ? (
    <Result
      status="success"
      title={t("login.register_success_title")}
      subTitle={t("login.register_success_subtitle")}
      extra={[
        <Button key="login" type="primary" onClick={() => { setRegisterSuccess(false); setActiveTab('login'); }}>
          {t("login.back_to_login")}
        </Button>,
      ]}
    />
  ) : (
    <Form form={registerForm} layout="vertical" onFinish={handleRegister} style={{ marginTop: 8 }}>
      <Form.Item name="businessName" rules={[{ required: true, message: t("login.req_business") }]}>
        <Input size="large" prefix={<ShopOutlined style={{ color: '#bbb' }} />} placeholder={t("login.business_name")} />
      </Form.Item>
      <Form.Item name="userName" rules={[{ required: true, message: t("login.req_username") }]}>
        <Input size="large" prefix={<UserOutlined style={{ color: '#bbb' }} />} placeholder={t("login.username")} />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, min: 6, message: t("login.req_password_min") }]}>
        <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder={t("login.password")} />
      </Form.Item>
      <Form.Item name="confirmPassword" rules={[{ required: true, message: t("login.req_confirm") }]}>
        <Input.Password size="large" prefix={<LockOutlined style={{ color: '#bbb' }} />} placeholder={t("login.confirm_password")} />
      </Form.Item>
      <div style={{ marginBottom: 16, padding: '10px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6 }}>
        <Text style={{ fontSize: 12, color: '#ad6800' }}>
          {t("login.pending_notice")}
        </Text>
      </div>
      <Button type="primary" htmlType="submit" size="large" block loading={registerLoading}>
        {t("login.register_btn")}
      </Button>
    </Form>
  );

  return (
    <AppThemeProvider>
      {contextHolder}
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--background)' }}>
        <Card style={{ width: 440, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderRadius: 12 }} bordered={false}>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>{t("login.title")}</Title>
          <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
            {t("login.subtitle")}
          </Text>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            centered
            items={[
              { key: 'login', label: t("login.tab_login"), children: loginTab },
              { key: 'register', label: t("login.tab_register"), children: registerTab },
            ]}
          />
        </Card>
      </div>
    </AppThemeProvider>
  );
};
