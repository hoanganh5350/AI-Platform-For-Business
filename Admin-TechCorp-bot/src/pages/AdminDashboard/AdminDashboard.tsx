import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, message } from 'antd';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
// Using basic Recharts or ant-design/charts if available. If not, simple HTML visual or just lists.
// To ensure it works without adding big deps, we'll use a simple CSS bar chart/pie chart.
import { BarChartOutlined, PieChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DashboardStats {
  signupsPerMonth: { month: string; count: number }[];
  industries: { industry: string; count: number }[];
  chatbotUsage: { label: string; count: number }[];
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await AdminAPI.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
        message.error('Lỗi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <AppThemeProvider>
      <div style={{ padding: 24 }}>
        <Title level={3} style={{ marginBottom: 24 }}>Dashboard Quản trị viên</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title={<><BarChartOutlined /> Số lượng Account Business mới đăng ký theo tháng</>}>
              {stats?.signupsPerMonth && stats?.signupsPerMonth?.length > 0 ? (
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', height: 200, paddingBottom: 20 }}>
                  {stats?.signupsPerMonth?.map((item) => (
                    <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{ width: '100%', backgroundColor: 'var(--primary)', height: `${Math.max(item.count * 10, 10)}px`, minHeight: 20, borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
                        {item.count}
                      </div>
                      <Text style={{ fontSize: 12, marginTop: 8 }}>{item.month}</Text>
                    </div>
                  ))}
                </div>
              ) : <Text>Chưa có dữ liệu</Text>}
            </Card>
          </Col>

          <Col span={12}>
            <Card title={<><PieChartOutlined /> Lĩnh vực ngành nghề</>}>
              {stats?.industries && stats?.industries?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {stats?.industries?.map((ind, i) => (
                    <li key={i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{ind.industry}</Text>
                      <Text>{ind.count} tài khoản</Text>
                    </li>
                  ))}
                </ul>
              ) : <Text>Chưa có dữ liệu</Text>}
            </Card>
          </Col>

          <Col span={12}>
            <Card title={<><PieChartOutlined /> Tỉ lệ đăng ký chatbot</>}>
              {stats?.chatbotUsage && stats?.chatbotUsage?.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {stats?.chatbotUsage?.map((u, i) => (
                    <li key={i} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{u.label}</Text>
                      <Text>{u.count} tài khoản</Text>
                    </li>
                  ))}
                </ul>
              ) : <Text>Chưa có dữ liệu</Text>}
            </Card>
          </Col>
        </Row>
      </div>
    </AppThemeProvider>
  );
};
