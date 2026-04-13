import { getDashboardAPI, getFoodsAPI, getOrdersAPI } from '@/services/api';
import { App, Card, Col, List, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import type { StatisticProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import CountUp from 'react-countup';
import dayjs from 'dayjs';

const statusLabelMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'orange' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
  PREPARING: { label: 'Đang chuẩn bị', color: 'cyan' },
  READY: { label: 'Sẵn sàng', color: 'geekblue' },
  DELIVERED: { label: 'Đã giao', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' }
};

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

const AdminDashboardPage = () => {
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    countOrder: 0,
    countUser: 0,
    countFood: 0
  });
  const [recentFoods, setRecentFoods] = useState<IFood[]>([]);
  const [recentOrders, setRecentOrders] = useState<IOrderResponse[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [dashboardRes, foodsRes, ordersRes] = await Promise.all([
          getDashboardAPI(),
          getFoodsAPI(),
          getOrdersAPI()
        ]);

        if (dashboardRes?.data) {
          setMetrics({
            countOrder: dashboardRes.data.countOrder ?? 0,
            countUser: dashboardRes.data.countUser ?? 0,
            countFood: dashboardRes.data.countFood ?? dashboardRes.data.countBook ?? 0
          });
        }

        const foods = Array.isArray(foodsRes) ? foodsRes : [];
        const orders = Array.isArray(ordersRes) ? ordersRes : [];

        setRecentFoods(
          [...foods]
            .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
            .slice(0, 5)
        );
        setRecentOrders(
          [...orders]
            .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
            .slice(0, 5)
        );
      } catch (error: any) {
        notification.error({
          message: 'Không tải được dashboard',
          description: error?.message || 'Vui lòng thử lại sau'
        });
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [notification]);

  const completedOrders = useMemo(
    () => recentOrders.filter((order) => order.status === 'DELIVERED').length,
    [recentOrders]
  );

  const formatter: StatisticProps['formatter'] = (value) => (
    <CountUp end={Number(value)} separator="," />
  );

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div className="admin-hero__inner">
          <div className="admin-hero__copy">
            <Typography.Title level={2} style={{ margin: 0, color: '#fff' }}>
              Tổng quan vận hành
            </Typography.Title>
            <p>
              Theo dõi nhanh số lượng món ăn, đơn hàng và các hoạt động gần đây trên một giao diện đồng bộ, sạch và dễ điều khiển.
            </p>
            <div className="admin-hero__chips">
              <span className="admin-hero__chip">Quản lý món ăn</span>
              <span className="admin-hero__chip">Điều phối đơn hàng</span>
              <span className="admin-hero__chip">Thiết kế đồng nhất</span>
            </div>
          </div>
          <Card className="admin-card" style={{ borderRadius: 22 }}>
            <Statistic
              title="Tổng số đơn đã hoàn tất"
              value={completedOrders}
              formatter={formatter}
              valueStyle={{ color: '#0f172a', fontWeight: 800 }}
            />
          </Card>
        </div>
      </section>

      <Row gutter={[18, 18]}>
        <Col span={24} lg={8}>
          <Card className="admin-card">
            <div className="admin-stat">
              <div className="admin-stat__label">Món ăn</div>
              <div className="admin-stat__value">
                <Statistic value={metrics.countFood} formatter={formatter} />
              </div>
              <div className="admin-stat__meta">Danh sách món ăn đang được quản trị</div>
            </div>
          </Card>
        </Col>
        <Col span={24} lg={8}>
          <Card className="admin-card">
            <div className="admin-stat">
              <div className="admin-stat__label">Đơn hàng</div>
              <div className="admin-stat__value">
                <Statistic value={metrics.countOrder} formatter={formatter} />
              </div>
              <div className="admin-stat__meta">Tổng đơn hàng hệ thống ghi nhận</div>
            </div>
          </Card>
        </Col>
        <Col span={24} lg={8}>
          <Card className="admin-card">
            <div className="admin-stat">
              <div className="admin-stat__label">Người dùng</div>
              <div className="admin-stat__value">
                <Statistic value={metrics.countUser} formatter={formatter} />
              </div>
              <div className="admin-stat__meta">Tài khoản đang hoạt động trong hệ thống</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={12}>
          <Card
            className="admin-table-card"
            title="Món cập nhật gần đây"
            bordered={false}
          >
            <Spin spinning={loading}>
              <List
                dataSource={recentFoods}
                renderItem={(food) => (
                  <List.Item>
                    <List.Item.Meta
                      title={food.name}
                      description={`${food.description || 'Không có mô tả'} • ${dayjs(food.updatedAt).format('DD/MM/YYYY HH:mm')}`}
                    />
                    <Tag color={food.isAvailable ? 'green' : 'red'}>
                      {food.isAvailable ? 'Đang bán' : 'Ngưng bán'}
                    </Tag>
                    <strong>{currency.format(Number(food.price || 0))}</strong>
                  </List.Item>
                )}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            className="admin-table-card"
            title="Đơn hàng gần đây"
            bordered={false}
          >
            <Spin spinning={loading}>
              <List
                dataSource={recentOrders}
                renderItem={(order) => {
                  const statusMeta = statusLabelMap[order.status] || { label: order.status, color: 'default' };
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={`${order.orderCode} • ${order.userName || `User #${order.userId}`}`}
                        description={`${dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')} • ${order.deliveryAddress}`}
                      />
                      <Space>
                        <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                        <strong>{currency.format(Number(order.totalAmount || 0))}</strong>
                      </Space>
                    </List.Item>
                  );
                }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;