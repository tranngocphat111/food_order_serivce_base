
import { App, Button, Col, Divider, Form, Radio, Row, Space } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Input } from 'antd';
import { useCurrentApp } from '@/components/context/app.context';
import type { FormProps } from 'antd';
import { createOrderAPI, createPaymentAPI } from '@/services/api';
import { isMobile } from 'react-device-detect';

const { TextArea } = Input;

type UserMethod = "COD" | "BANKING";

type FieldType = {
    fullName: string;
    phone: string;
    address: string;
    note: string;
    method: UserMethod;
};

interface IProps {
    setCurrentStep: (v: number) => void;
}
const Payment = (props: IProps) => {
    const { carts, setCarts, user } = useCurrentApp();
    const [totalPrice, setTotalPrice] = useState(0);

    const [form] = Form.useForm();

    const [isSubmit, setIsSubmit] = useState(false);
    const { message, notification } = App.useApp();
    const { setCurrentStep } = props;

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName,
                phone: user.phone || '',
                method: "COD"
            })
        }
    }, [user])

    useEffect(() => {
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.map(item => {
                sum += item.quantity * item.detail.price;
            })
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }
    }, [carts]);


    const handleRemoveFood = (id: number) => {
        const cartStorage = localStorage.getItem("carts");
        if (cartStorage) {
            const cartsData = JSON.parse(cartStorage) as ICart[];
            const newCarts = cartsData.filter(item => item.id !== id);
            localStorage.setItem("carts", JSON.stringify(newCarts));
            setCarts(newCarts);
        }
    }

    const handlePlaceOrder: FormProps<FieldType>['onFinish'] = async (values) => {
        const { address, fullName, method, phone, note } = values;

        if (!user) {
            notification.error({
                message: "Lỗi",
                description: "Vui lòng đăng nhập để đặt hàng",
                duration: 5
            });
            return;
        }

        // Build order items for order-service
        const items: IOrderItem[] = carts.map(item => ({
            foodId: item.id,
            quantity: item.quantity
        }));

        setIsSubmit(true);

        try {
            // Step 1: Create order via order-service
            const orderRes = await createOrderAPI(
                user.id,
                items,
                address,
                note || ''
            ) as any;

            if (orderRes && (orderRes.id || orderRes.orderId)) {
                const orderId = orderRes.id || orderRes.orderId;

                // Step 2: Create payment via payment-notification-service
                const paymentRes = await createPaymentAPI(
                    orderId,
                    user.id,
                    method
                ) as any;

                if (paymentRes && (paymentRes.paymentId || paymentRes.paymentStatus === 'SUCCESS')) {
                    // Success - clear cart
                    localStorage.removeItem("carts");
                    setCarts([]);
                    notification.success({
                        message: 'Thanh toán thành công',
                        description: `Mã thanh toán: ${paymentRes.paymentCode || paymentRes.transactionRef}. Đơn hàng của bạn đã được xác nhận.`,
                        duration: 5
                    });
                    setCurrentStep(2);
                } else {
                    // Payment failed but order was created
                    notification.warning({
                        message: "Cảnh báo",
                        description: "Đơn hàng đã được tạo nhưng thanh toán thất bại. Vui lòng thanh toán sau.",
                        duration: 5
                    });
                    localStorage.removeItem("carts");
                    setCarts([]);
                    setCurrentStep(2);
                }
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: orderRes?.message || 'Không thể tạo đơn hàng',
                    duration: 5
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Có lỗi xảy ra",
                description: error?.message || 'Không thể kết nối đến server',
                duration: 5
            });
        }

        setIsSubmit(false);
    }

    return (
        <div style={{ overflow: "hidden" }}>
            <Row gutter={[20, 20]}>
                <Col md={16} xs={24}>
                    {carts?.map((item, index) => {
                        const currentFoodPrice = item?.detail?.price ?? 0;
                        return (
                            <div className='order-book' key={`index-${index}`}
                                style={isMobile ? { flexDirection: 'column' } : {}}
                            >
                                {!isMobile ?
                                    <>
                                        <div className='book-content'>
                                            <img 
                                                src={`https://food-service-images.s3.ap-southeast-1.amazonaws.com/meals/${item?.detail?.imageUrl}` || '/default-food.png'} 
                                                alt={item?.detail?.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/default-food.png';
                                                }}
                                            />
                                            <div className='title'>
                                                {item?.detail?.name}
                                            </div>
                                            <div className='price'>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentFoodPrice)}
                                            </div>
                                        </div>
                                        <div className='action'>
                                            <div className='quantity'>
                                                Số lượng: {item?.quantity}
                                            </div>
                                            <div className='sum'>
                                                Tổng:  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentFoodPrice * (item?.quantity ?? 0))}
                                            </div>
                                            <DeleteTwoTone
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleRemoveFood(item.id)}
                                                twoToneColor="#eb2f96"
                                            />
                                        </div>
                                    </>
                                    :
                                    <>
                                        <div>{item?.detail?.name}</div>
                                        <div className='book-content ' style={{ width: "100%" }}>
                                            <img 
                                                src={`https://food-service-images.s3.ap-southeast-1.amazonaws.com/meals/${item?.detail?.imageUrl}` || '/default-food.png'} 
                                                alt={item?.detail?.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/default-food.png';
                                                }}
                                            />
                                            <div className='action' >
                                                <div className='quantity'>
                                                    Số lượng: {item?.quantity}
                                                </div>
                                                <DeleteTwoTone
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => handleRemoveFood(item.id)}
                                                    twoToneColor="#eb2f96"
                                                />
                                            </div>
                                        </div>
                                        <div className='sum'>
                                            Tổng:  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentFoodPrice * (item?.quantity ?? 0))}
                                        </div>
                                    </>
                                }
                            </div>
                        )
                    })}

                    <div><span
                        style={{ cursor: "pointer" }}
                        onClick={() => setCurrentStep(0)}>
                        Quay trở lại
                    </span>
                    </div>
                </Col>
                <Col md={8} xs={24} >
                    <Form
                        form={form}
                        name="payment-form"
                        onFinish={handlePlaceOrder}
                        autoComplete="off"
                        layout='vertical'
                    >
                        <div className='order-sum'>
                            <Form.Item<FieldType>
                                label="Hình thức thanh toán"
                                name="method"
                            >
                                <Radio.Group>
                                    <Space direction="vertical">
                                        <Radio value={"COD"}>Thanh toán khi nhận hàng</Radio>
                                        <Radio value={"BANKING"}>Chuyển khoản ngân hàng</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Họ tên"
                                name="fullName"
                                rules={[
                                    { required: true, message: 'Họ tên không được để trống!' },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Số điện thoại"
                                name="phone"
                                rules={[
                                    { required: true, message: 'Số điện thoại không được để trống!' },
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Địa chỉ nhận hàng"
                                name="address"
                                rules={[
                                    { required: true, message: 'Địa chỉ không được để trống!' },
                                ]}
                            >
                                <TextArea rows={3} />
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Ghi chú"
                                name="note"
                            >
                                <TextArea rows={2} placeholder="Ghi chú thêm (không bắt buộc)" />
                            </Form.Item>

                            <div className='calculate'>
                                <span>  Tạm tính</span>
                                <span>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                                </span>
                            </div>
                            <Divider style={{ margin: "10px 0" }} />
                            <div className='calculate'>
                                <span> Tổng tiền</span>
                                <span className='sum-final'>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                                </span>
                            </div>
                            <Divider style={{ margin: "10px 0" }} />
                            <Button
                                color="danger" variant="solid"
                                htmlType='submit'
                                loading={isSubmit}
                            >
                                Đặt Hàng ({carts?.length ?? 0})
                            </Button>
                        </div>
                    </Form>

                </Col>
            </Row>
        </div>
    )
}

export default Payment;
