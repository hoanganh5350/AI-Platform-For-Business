import React, { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Typography, Spin, Statistic, Select } from 'antd';
import { AdminAPI } from '../../api/client';
import { AppThemeProvider } from '../../components/AppThemeProvider/AppThemeProvider';
import { useAppNotification } from '../../hooks/useAppNotification';
import { useTranslation } from 'react-i18next';
import { useGetThemeSystem } from '../../hook/useGetThemeSystem';
import { TeamOutlined, ShopOutlined, RiseOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const { Title } = Typography;

interface DashboardStats {
  signupsPerMonth: { month: string; count: number }[];
  industries: { industry: string; count: number }[];
  chatbotUsage: { label: string; count: number }[];
  totalBusinesses?: number;
  totalAdmins?: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');
  const { notifyError, contextHolder } = useAppNotification();
  const { t } = useTranslation();
  const { theme } = useGetThemeSystem();

  const isDark = theme === 'dark';

  // ECharts theme tokens
  const chartColors = useMemo(() => ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#fb923c'], []);
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const bgColor = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';

  useEffect(() => { 
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await AdminAPI.getDashboardStats(period);
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
        notifyError(t('common.error'), 'Lỗi tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  // ─── Bar Chart: Signups per month ───
  const barOption = useMemo(() => ({
    backgroundColor: bgColor,
    grid: { top: 20, right: 20, bottom: 40, left: 50, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor },
    },
    xAxis: {
      type: 'category',
      data: stats?.signupsPerMonth?.map(d => d.month) ?? [],
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: axisColor },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: axisColor },
      splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
    },
    series: [
      {
        name: t('admin.chart_signups'),
        type: 'bar',
        data: stats?.signupsPerMonth?.map(d => d.count) ?? [],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#6366f1' },
              { offset: 1, color: '#818cf8' },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
        barMaxWidth: 48,
        emphasis: {
          itemStyle: { color: '#4f46e5' },
        },
        label: {
          show: true,
          position: 'top',
          color: axisColor,
          fontSize: 11,
        },
      },
    ],
  }), [stats, isDark, axisColor, bgColor, t, textColor, tooltipBg, tooltipBorder]);

  // ─── Pie Chart: Industries ───
  const pieIndustryOption = useMemo(() => ({
    backgroundColor: bgColor,
    tooltip: {
      trigger: 'item',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 4,
      textStyle: { color: axisColor },
    },
    series: [
      {
        name: t('admin.chart_industries'),
        type: 'pie',
        radius: ['38%', '65%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: bgColor, borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold', color: textColor },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(99,102,241,0.4)' },
        },
        data: (stats?.industries ?? []).map((ind, i) => ({
          value: ind.count,
          name: ind.industry || t('admin.no_data'),
          itemStyle: { color: chartColors[i % chartColors.length] },
        })),
      },
    ],
  }), [stats, axisColor, bgColor, t, textColor, tooltipBg, tooltipBorder, chartColors]);

  // ─── Pie Chart: Chatbot Usage ───
  const pieUsageOption = useMemo(() => ({
    backgroundColor: bgColor,
    tooltip: {
      trigger: 'item',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      textStyle: { color: textColor },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      bottom: 4,
      textStyle: { color: axisColor },
    },
    series: [
      {
        name: t('admin.chart_usage'),
        type: 'pie',
        radius: ['38%', '65%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: bgColor, borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 13, fontWeight: 'bold', color: textColor },
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(34,211,238,0.4)' },
        },
        data: (stats?.chatbotUsage ?? []).map((u, i) => ({
          value: u.count,
          name: u.label || t('admin.no_data'),
          itemStyle: { color: chartColors[(i + 2) % chartColors.length] },
        })),
      },
    ],
  }), [stats, axisColor, bgColor, t, textColor, tooltipBg, tooltipBorder, chartColors]);

  const totalSignups = stats?.signupsPerMonth?.reduce((s, d) => s + d.count, 0) ?? 0;

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Spin size="large" /></div>;

  return (
    <AppThemeProvider>
      {contextHolder}
      <div style={{ padding: 24 }}>
        <Title level={3} style={{ marginBottom: 24 }}>{t('admin.dashboard_title')}</Title>

        {/* ── Summary cards ── */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(99,102,241,0.10)' }}>
              <Statistic
                title={t('admin.chart_signups')}
                value={totalSignups}
                prefix={<RiseOutlined style={{ color: '#6366f1' }} />}
                valueStyle={{ color: '#6366f1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(34,211,238,0.10)' }}>
              <Statistic
                title={t('admin.chart_industries')}
                value={stats?.industries?.length ?? 0}
                prefix={<ShopOutlined style={{ color: '#22d3ee' }} />}
                valueStyle={{ color: '#22d3ee' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(245,158,11,0.10)' }}>
              <Statistic
                title={t('admin.chart_usage')}
                value={stats?.chatbotUsage?.length ?? 0}
                prefix={<TeamOutlined style={{ color: '#f59e0b' }} />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>

        {/* ── Bar Chart ── */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title={t('admin.chart_signups')}
              extra={
                <Select
                  value={period}
                  onChange={(val) => setPeriod(val)}
                  style={{ width: 120 }}
                >
                  <Select.Option value="day">{t('admin.filter_day')}</Select.Option>
                  <Select.Option value="month">{t('admin.filter_month')}</Select.Option>
                  <Select.Option value="year">{t('admin.filter_year')}</Select.Option>
                </Select>
              }
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              {(stats?.signupsPerMonth?.length ?? 0) > 0 ? (
                <ReactECharts
                  option={barOption}
                  style={{ height: 260 }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: axisColor }}>{t('admin.no_data')}</div>
              )}
            </Card>
          </Col>

          {/* ── Pie: Industries ── */}
          <Col xs={24} md={12}>
            <Card
              title={t('admin.chart_industries')}
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              {(stats?.industries?.length ?? 0) > 0 ? (
                <ReactECharts
                  option={pieIndustryOption}
                  style={{ height: 280 }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: axisColor }}>{t('admin.no_data')}</div>
              )}
            </Card>
          </Col>

          {/* ── Pie: Chatbot Usage ── */}
          <Col xs={24} md={12}>
            <Card
              title={t('admin.chart_usage')}
              bordered={false}
              style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {(stats?.chatbotUsage?.length ?? 0) > 0 ? (
                <ReactECharts
                  option={pieUsageOption}
                  style={{ height: 280 }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: axisColor }}>{t('admin.no_data')}</div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </AppThemeProvider>
  );
};
