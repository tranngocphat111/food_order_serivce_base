import BookDetail from "@/components/client/book/book.detail";
import BookLoader from "@/components/client/book/book.loader";
import { getFoodByIdAPI } from "@/services/api";
import { App } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BookPage = () => {
    let { id } = useParams();
    const { notification } = App.useApp();
    const [currentFood, setCurrentFood] = useState<IFood | null>(null);
    const [isLoadingFood, setIsLoadingFood] = useState<boolean>(true);

    useEffect(() => {
        if (id) {
            const fetchFoodById = async () => {
                setIsLoadingFood(true);
                try {
                    const res = await getFoodByIdAPI(Number(id)) as any;
                    if (res && (res.id || res.data?.id)) {
                        setCurrentFood(res.id ? res : res.data);
                    } else {
                        notification.error({
                            message: 'Đã có lỗi xảy ra',
                            description: res?.message || 'Không tìm thấy món ăn'
                        });
                    }
                } catch (error: any) {
                    notification.error({
                        message: 'Đã có lỗi xảy ra',
                        description: error?.message || 'Không thể kết nối đến server'
                    });
                }
                setIsLoadingFood(false);
            }
            fetchFoodById();
        }
    }, [id])
    return (
        <div>
            {isLoadingFood ?
                <BookLoader />
                :
                <BookDetail
                    currentFood={currentFood}
                />
            }
        </div>
    )
}

export default BookPage;
