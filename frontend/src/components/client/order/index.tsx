import { App, Button, Col, Divider, Empty, InputNumber, Row } from 'antd';
import { DeleteTwoTone } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useCurrentApp } from '@/components/context/app.context';
import 'styles/order.scss';
import { isMobile } from 'react-device-detect';

interface IProps {
    setCurrentStep: (v: number) => void;
}

const OrderDetail = (props: IProps) => {
    const { setCurrentStep } = props;
    const { carts, setCarts } = useCurrentApp();
    const [totalPrice, setTotalPrice] = useState(0);

    const { message } = App.useApp();

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

    const handleOnChangeInput = (value: number, food: IFood) => {
        if (!value || +value < 1) return;
        if (!isNaN(+value)) {
            const cartStorage = localStorage.getItem("carts");
            if (cartStorage && food) {
                const cartsData = JSON.parse(cartStorage) as ICart[];

                // Check if exists
                let isExistIndex = cartsData.findIndex(c => c.id === food?.id);
                if (isExistIndex > -1) {
                    cartsData[isExistIndex].quantity = +value;
                }

                localStorage.setItem("carts", JSON.stringify(cartsData));
                setCarts(cartsData);
            }
        }
    }

    const handleRemoveFood = (id: number) => {
        const cartStorage = localStorage.getItem("carts");
        if (cartStorage) {
            const cartsData = JSON.parse(cartStorage) as ICart[];
            const newCarts = cartsData.filter(item => item.id !== id);
            localStorage.setItem("carts", JSON.stringify(newCarts));
            setCarts(newCarts);
        }
    }

    const handleNextStep = () => {
        if (!carts.length) {
            message.error("Không tồn tại món ăn trong giỏ hàng.")
            return;
        }
        setCurrentStep(1)
    }

    return (
        <div style={{ background: '#efefef', padding: "20px 0" }}>
            <div className="order-container" style={{ maxWidth: 1440, margin: '0 auto', overflow: "hidden" }}>
                <Row gutter={[20, 20]}>
                    <Col md={18} xs={24}>
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
                                                    <InputNumber
                                                        onChange={(value) => handleOnChangeInput(value as number, item.detail)}
                                                        value={item.quantity}
                                                        min={1}
                                                        max={item.detail.stockQty}
                                                    />
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
                                                        <InputNumber
                                                            onChange={(value) => handleOnChangeInput(value as number, item.detail)}
                                                            value={item.quantity}
                                                            min={1}
                                                            max={item.detail.stockQty}
                                                        />
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

                        {carts.length === 0 &&
                            <Empty
                                description="Không có món ăn trong giỏ hàng"
                            />
                        }
                    </Col>
                    <Col md={6} xs={24} >
                        <div className='order-sum'>
                            <div className='calculate'>
                                <span> Tạm tính</span>
                                <span>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                                </span>
                            </div>
                            <Divider style={{ margin: "10px 0" }} />
                            <div className='calculate'>
                                <span>Tổng tiền</span>
                                <span className='sum-final'>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice || 0)}
                                </span>
                            </div>
                            <Divider style={{ margin: "10px 0" }} />
                            <Button
                                color="danger" variant="solid"
                                onClick={() => handleNextStep()}
                            >
                                Đặt Hàng ({carts?.length ?? 0})
                            </Button>

                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default OrderDetail;