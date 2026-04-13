import { getOrdersAPI, updateOrderStatusAPI } from '@/services/api';
import { App, Button, Card, Drawer, Form, Input, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

const ORDER_STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'orange' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'blue' },
  PREPARING: { label: 'Đang chuẩn bị', color: 'cyan' },
  READY: { label: 'Sẵn sàng', color: 'geekblue' },
  DELIVERED: { label: 'Đã giao', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' }
};

const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label
}));

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

const AdminOrderPage = () => {
  const { message, notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<IOrderResponse[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderResponse | null>(null);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<IOrderResponse | null>(null);
  const [form] = Form.useForm<{ status: OrderStatus }>();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrdersAPI();
      setOrders(Array.isArray(res) ? res : []);
    } catch (error: any) {
      notification.error({
        message: 'Không tải được danh sách đơn hàng',
        description: error?.message || 'Vui lòng thử lại sau'
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchedText = `${order.orderCode} ${order.userName} ${order.deliveryAddress}`
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchedStatus = statusFilter === 'all' ? true : order.status === statusFilter;
      return matchedText && matchedStatus;
    });
  }, [orders, searchText, statusFilter]);

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'PENDING').length;
    const delivered = orders.filter((order) => order.status === 'DELIVERED').length;
    const cancelled = orders.filter((order) => order.status === 'CANCELLED').length;
    return { pending, delivered, cancelled };
  }, [orders]);

  const openOrderDetail = (order: IOrderResponse) => {
    setSelectedOrder(order);
    setOpenDrawer(true);
  };

  const openStatusEditor = (order: IOrderResponse) => {
    setUpdatingOrder(order);
    form.setFieldsValue({ status: order.status as OrderStatus });
    setOpenStatusModal(true);
  };

  const handleUpdateStatus = async (values: { status: OrderStatus }) => {
    if (!updatingOrder) return;

    try {
      await updateOrderStatusAPI(updatingOrder.id, values.status);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      setOpenStatusModal(false);
      setUpdatingOrder(null);
      form.resetFields();
      await loadOrders();
      if (selectedOrder?.id === updatingOrder.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: values.status } : prev));
      }
    } catch (error: any) {
      notification.error({
        message: 'Không cập nhật được trạng thái',
        description: error?.message || 'Vui lòng thử lại sau'
      });
    }
  };

  const columns: ColumnsType<IOrderResponse> = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderCode',
      render: (value, record) => (
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            openOrderDetail(record);
          }}
        >
          {value}
        </a>
      )
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      render: (value, record) => value || `User #${record.userId}`
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'deliveryAddress',
      ellipsis: true
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      render: (value) => currency.format(Number(value || 0))
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (value: OrderStatus) => {
        const statusMeta = ORDER_STATUS_META[value] || { label: value, color: 'default' };
        return <Tag color={statusMeta.color}>{statusMeta.label}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      width: 250,
      render: (_, record) => (
        <Space size={8} wrap className="admin-order-actions">
          <Button icon={<EyeOutlined />} onClick={() => openOrderDetail(record)}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} type="primary" ghost onClick={() => openStatusEditor(record)}>
            Cập nhật
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div className="admin-hero__inner">
          <div className="admin-hero__copy">
            <Typography.Title level={2} style={{ margin: 0, color: '#fff' }}>
              Quản lý đơn hàng
            </Typography.Title>
            <p>
              Xem nhanh trạng thái đơn, cập nhật tiến trình xử lý và theo dõi chi tiết từng đơn hàng ngay trong admin.
            </p>
            <div className="admin-hero__chips">
              <span className="admin-hero__chip">Theo dõi trạng thái</span>
              <span className="admin-hero__chip">Xem chi tiết đơn</span>
              <span className="admin-hero__chip">Cập nhật tức thì</span>
            </div>
          </div>
          <Card className="admin-card" style={{ borderRadius: 22 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <strong style={{ fontSize: 16, color: '#0f172a' }}>Tổng quan nhanh</strong>
              <Space wrap>
                <Tag color="orange">Chờ xác nhận: {stats.pending}</Tag>
                <Tag color="green">Đã giao: {stats.delivered}</Tag>
                <Tag color="red">Đã hủy: {stats.cancelled}</Tag>
              </Space>
              <span style={{ color: '#64748b' }}>
                Đơn hàng đang hiển thị theo bộ lọc trực tiếp.
              </span>
            </Space>
          </Card>
        </div>
      </section>

      <Card className="admin-table-card" bordered={false}>
        <div className="admin-toolbar">
          <div className="admin-toolbar__filters">
            <Input
              allowClear
              placeholder="Tìm theo mã đơn, khách hàng hoặc địa chỉ"
              style={{ width: 320 }}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <Select
              style={{ width: 200 }}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                ...ORDER_STATUS_OPTIONS
              ]}
            />
          </div>
          <div className="admin-toolbar__actions">
            <Button icon={<ReloadOutlined />} onClick={loadOrders}>
              Tải lại
            </Button>
          </div>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredOrders}
          scroll={{ x: 1180 }}
          pagination={{ pageSize: 8, showSizeChanger: true }}
        />
      </Card>

      <Drawer
        title="Chi tiết đơn hàng"
        width={560}
        open={openDrawer}
        onClose={() => {
          setOpenDrawer(false);
          setSelectedOrder(null);
        }}
      >
        {selectedOrder && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card className="admin-card">
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                  {selectedOrder.orderCode}
                </Typography.Title>
                <Tag color={ORDER_STATUS_META[selectedOrder.status as OrderStatus]?.color || 'default'}>
                  {ORDER_STATUS_META[selectedOrder.status as OrderStatus]?.label || selectedOrder.status}
                </Tag>
                <div style={{ color: '#64748b' }}>Khách hàng: {selectedOrder.userName || `User #${selectedOrder.userId}`}</div>
                <div style={{ color: '#64748b' }}>Địa chỉ: {selectedOrder.deliveryAddress}</div>
                {selectedOrder.note && <div style={{ color: '#64748b' }}>Ghi chú: {selectedOrder.note}</div>}
                <div style={{ color: '#0f172a', fontWeight: 700 }}>
                  Tổng tiền: {currency.format(Number(selectedOrder.totalAmount || 0))}
                </div>
              </Space>
            </Card>

            <div className="admin-detail-list">
              <div className="admin-item">
                <div className="admin-item__title">
                  <span>Ngày tạo</span>
                  <span>{dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                </div>
                <div className="admin-item__desc">Cập nhật lần cuối {dayjs(selectedOrder.updatedAt).format('DD/MM/YYYY HH:mm')}</div>
              </div>
              <div className="admin-item">
                <div className="admin-item__title">
                  <span>Danh sách món</span>
                </div>
                <div className="admin-detail-list" style={{ marginTop: 12 }}>
                  {selectedOrder.items?.map((item: any, index) => (
                    <div className="admin-item" key={`${item.foodId || item.id || index}`}>
                      <div className="admin-item__title">
                        <span>{item.foodName || item.name || `Món #${item.foodId}`}</span>
                        <span>x{item.quantity}</span>
                      </div>
                      <div className="admin-item__desc">
                        {currency.format(Number(item.price || 0))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Space>
        )}
      </Drawer>

      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={openStatusModal}
        onCancel={() => {
          setOpenStatusModal(false);
          setUpdatingOrder(null);
          form.resetFields();
        }}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateStatus}>
          <Form.Item
            name="status"
            label="Trạng thái mới"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select options={ORDER_STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminOrderPage;