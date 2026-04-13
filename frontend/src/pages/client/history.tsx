import { useEffect, useState } from "react";
import { App, Card, Divider, Drawer, Empty, Table, Tag, Typography } from 'antd';
import type { TableProps } from 'antd';
import dayjs from "dayjs";
import { FORMATE_DATE_VN } from "@/services/helper";
import { getHistoryAPI } from "@/services/api";

const HistoryPage = () => {

    const columns: TableProps<IOrderResponse>['columns'] = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (item, record, index) => (<>{index + 1}</>)
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
        },
        {
            title: 'Thời gian ',
            dataIndex: 'createdAt',
            render: (item, record, index) => {
                return dayjs(item).format(FORMATE_DATE_VN)
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            render: (item, record, index) => {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item)
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (item, record, index) => {
                const statusColors: Record<string, string> = {
                    'PENDING': 'orange',
                    'CONFIRMED': 'blue',
                    'PREPARING': 'cyan',
                    'READY': 'geekblue',
                    'DELIVERED': 'green',
                    'CANCELLED': 'red'
                };
                const statusLabels: Record<string, string> = {
                    'PENDING': 'Chờ xác nhận',
                    'CONFIRMED': 'Đã xác nhận',
                    'PREPARING': 'Đang chuẩn bị',
                    'READY': 'Sẵn sàng',
                    'DELIVERED': 'Đã giao',
                    'CANCELLED': 'Đã hủy'
                };
                return (
                    <Tag color={statusColors[item] || 'default'}>
                        {statusLabels[item] || item}
                    </Tag>
                );
            }
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'deliveryAddress',
            ellipsis: true,
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <a onClick={() => {
                    setOpenDetail(true);
                    setDataDetail(record);
                }} href="#">Xem chi tiết</a>
            ),
        },
    ];

    const [dataHistory, setDataHistory] = useState<IOrderResponse[]>([])
    const [loading, setLoading] = useState<boolean>(true);

    const [openDetail, setOpenDetail] = useState<boolean>(false);
    const [dataDetail, setDataDetail] = useState<IOrderResponse | null>(null);

    const { notification } = App.useApp();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getHistoryAPI();
                if (res && res.data) {
                    setDataHistory(res.data);
                } else {
                    notification.error({
                        message: 'Đã có lỗi xảy ra',
                        description: res?.message || 'Không thể tải lịch sử đơn hàng'
                    });
                }
            } catch (error: any) {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: error?.message || 'Không thể kết nối đến server'
                });
            }
            setLoading(false);
        }

        fetchData();
    }, [])

    return (
        <div className="page-surface" style={{ padding: '24px 0' }}>
            <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 16px' }}>
            <Card className="admin-table-card" bordered={false}>
                <Typography.Title level={3} style={{ marginTop: 0 }}>
                    Lịch sử đặt hàng
                </Typography.Title>
                <Divider />
                {dataHistory.length > 0 ? (
                    <Table
                        bordered
                        columns={columns}
                        dataSource={dataHistory}
                        rowKey="id"
                        loading={loading}
                    />
                ) : (
                    <Empty description="Chưa có đơn hàng nào" />
                )}
            </Card>
            <Drawer
                title="Chi tiết đơn hàng"
                onClose={() => {
                    setOpenDetail(false);
                    setDataDetail(null);
                }}
                open={openDetail}
                width={400}
            >
                {dataDetail && (
                    <>
                        <p><strong>Mã đơn:</strong> {dataDetail.orderCode}</p>
                        <p><strong>Địa chỉ:</strong> {dataDetail.deliveryAddress}</p>
                        {dataDetail.note && <p><strong>Ghi chú:</strong> {dataDetail.note}</p>}
                        <Divider />
                        <h4>Các món đã đặt:</h4>
                        {dataDetail.items?.map((item, index) => {
                            return (
                                <div key={index} style={{ marginBottom: 10, padding: 10, background: '#f5f5f5', borderRadius: 5 }}>
                                    <p><strong>{item.foodName}</strong></p>
                                    <p>Số lượng: {item.quantity}</p>
                                    <p>Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                                </div>
                            )
                        })}
                        <Divider />
                        <p><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataDetail.totalAmount)}</p>
                    </>
                )}
            </Drawer>
            </div>
        </div>
    )
}

export default HistoryPage;
