import { updatePaymentOrderAPI } from "@/services/api";
import { App, Button, Result, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const ReturnURLPage = () => {
    const [searchParams] = useSearchParams();
    const paymentRef = searchParams?.get("vnp_TxnRef") ?? "";
    const responseCode = searchParams?.get("vnp_ResponseCode") ?? "";

    const [loading, setLoading] = useState<boolean>(true);
    const [backendMessage, setBackendMessage] = useState<string>("");
    const { notification } = App.useApp();

    useEffect(() => {
        if (paymentRef) {
            const changePaymentStatus = async () => {
                setLoading(true);

                const res = await updatePaymentOrderAPI(
                    responseCode === "00" ? "PAYMENT_SUCCEED" : "PAYMENT_FAILED",
                    paymentRef
                );
                if (res.data) {
                    setBackendMessage(res.message ?? "");
                    if (res.data.type === "PAYMENT_SUCCESS") {
                        notification.success({
                            message: "Thanh toán thành công",
                            description: res.data.message,
                            duration: 5
                        });
                    } else {
                        notification.warning({
                            message: "Thanh toán thất bại",
                            description: res.data.message,
                            duration: 5
                        });
                    }
                } else {
                    setBackendMessage(res.message ?? "");
                    notification.error({
                        message: "Có lỗi xảy ra",
                        description:
                            res.message && Array.isArray(res.message)
                                ? res.message[0] : res.message,
                        duration: 5
                    })
                }

                setLoading(false);
            }
            changePaymentStatus();
        } else {
            setLoading(false);
        }
    }, [paymentRef, responseCode, notification])

    return (
        <>
            {loading ?
                <div style={{ padding: 50 }}>
                    <Skeleton active />
                </div>
                :
                <>
                    {responseCode === "00" ?
                        <Result
                            status="success"
                            title="Đặt hàng thành công"
                            subTitle={backendMessage || "Hệ thống đã ghi nhận thông tin đơn hàng của bạn."}
                            extra={[
                                <Button key="home">
                                    <Link to={"/"} type="primary">
                                        Trang Chủ
                                    </Link>
                                </Button>,

                                <Button key="history">
                                    <Link to={"/history"} type="primary">
                                        Lịch sử mua hàng
                                    </Link>
                                </Button>,
                            ]}
                        />
                        :
                        <Result
                            status="error"
                            title="Giao dịch thanh toán không thành công"
                            subTitle={backendMessage || "Vui lòng liên hệ admin để được hỗ trợ."}
                            extra={
                                <Button type="primary" key="console">
                                    <Link to={"/"} type="primary">
                                        Trang Chủ
                                    </Link>
                                </Button>
                            }
                        />
                    }
                </>
            }
        </>
    )
}

export default ReturnURLPage;
