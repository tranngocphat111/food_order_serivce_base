import { Row, Col, Rate, Divider, App, Breadcrumb } from 'antd';
import ImageGallery from 'react-image-gallery';
import { useEffect, useRef, useState } from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { BsCartPlus } from 'react-icons/bs';
import 'styles/book.scss';
import ModalGallery from './modal.gallery';
import { useCurrentApp } from '@/components/context/app.context';
import { Link, useNavigate } from 'react-router-dom';
import { resolveFoodImageUrl } from '@/services/helper';

interface IProps {
    currentFood: IFood | null;
}

type UserAction = 'MINUS' | 'PLUS';

const BookDetail = (props: IProps) => {
    const { currentFood } = props;
    const [imageGallery, setImageGallery] = useState<{
        original: string;
        thumbnail: string;
        originalClass: string;
        thumbnailClass: string;
    }[]>([]);

    const [isOpenModalGallery, setIsOpenModalGallery] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const refGallery = useRef<ImageGallery>(null);
    const [currentQuantity, setCurrentQuantity] = useState<number>(1);

    const { setCarts, user } = useCurrentApp();
    const { message } = App.useApp();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentFood) return;

        const images = [];
        if (currentFood.imageUrl) {
            images.push({
                original: resolveFoodImageUrl(currentFood.imageUrl),
                thumbnail: resolveFoodImageUrl(currentFood.imageUrl),
                originalClass: 'original-image',
                thumbnailClass: 'thumbnail-image'
            });
        } else {
            images.push({
                original: '/default-food.png',
                thumbnail: '/default-food.png',
                originalClass: 'original-image',
                thumbnailClass: 'thumbnail-image'
            });
        }

        setImageGallery(images);
        setCurrentQuantity(1);
    }, [currentFood]);

    const handleOnClickImage = () => {
        setIsOpenModalGallery(true);
        setCurrentIndex(refGallery?.current?.getCurrentIndex() ?? 0);
    };

    const handleChangeButton = (type: UserAction) => {
        if (!currentFood) return;

        if (type === 'MINUS') {
            if (currentQuantity - 1 <= 0) return;
            setCurrentQuantity(currentQuantity - 1);
        }

        if (type === 'PLUS') {
            if (currentQuantity === currentFood.stockQty) return;
            setCurrentQuantity(currentQuantity + 1);
        }
    };

    const handleChangeInput = (value: string) => {
        if (!currentFood) return;
        if (!isNaN(+value) && +value > 0 && +value <= currentFood.stockQty) {
            setCurrentQuantity(+value);
        }
    };

    const handleAddToCart = (isBuyNow = false) => {
        if (!user) {
            message.error('Bạn cần đăng nhập để thực hiện tính năng này.');
            return;
        }

        if (!currentFood?.isAvailable) {
            message.error('Món ăn hiện không còn hàng.');
            return;
        }

        const cartStorage = localStorage.getItem('carts');
        if (cartStorage && currentFood) {
            const carts = JSON.parse(cartStorage) as ICart[];

            const isExistIndex = carts.findIndex((c) => c.id === currentFood.id);
            if (isExistIndex > -1) {
                carts[isExistIndex].quantity = carts[isExistIndex].quantity + currentQuantity;
            } else {
                carts.push({
                    quantity: currentQuantity,
                    id: currentFood.id,
                    detail: currentFood
                });
            }

            localStorage.setItem('carts', JSON.stringify(carts));
            setCarts(carts);
        } else {
            const data: ICart[] = [{
                id: currentFood.id,
                quantity: currentQuantity,
                detail: currentFood
            }];
            localStorage.setItem('carts', JSON.stringify(data));
            setCarts(data);
        }

        if (isBuyNow) {
            navigate('/order');
        } else {
            message.success('Thêm món ăn vào giỏ hàng thành công.');
        }
    };

    return (
        <div className="page-surface" style={{ padding: '24px 0' }}>
            <div className='view-detail-book' style={{ maxWidth: 1440, margin: '0 auto', minHeight: 'calc(100vh - 150px)' }}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to={'/'}>Trang Chủ</Link>,
                        },
                        {
                            title: 'Chi tiết món ăn',
                        },
                    ]}
                />
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.92)', borderRadius: 20, border: '1px solid var(--border-soft)', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.05)' }}>
                    <Row gutter={[20, 20]}>
                        <Col md={10} sm={0} xs={0}>
                            <ImageGallery
                                ref={refGallery}
                                items={imageGallery}
                                showPlayButton={false}
                                showFullscreenButton={false}
                                renderLeftNav={() => <></>}
                                renderRightNav={() => <></>}
                                slideOnThumbnailOver
                                onClick={handleOnClickImage}
                            />
                        </Col>
                        <Col md={14} sm={24}>
                            <Col md={0} sm={24} xs={24}>
                                <ImageGallery
                                    ref={refGallery}
                                    items={imageGallery}
                                    showPlayButton={false}
                                    showFullscreenButton={false}
                                    renderLeftNav={() => <></>}
                                    renderRightNav={() => <></>}
                                    showThumbnails={false}
                                />
                            </Col>
                            <Col span={24}>
                                <div className='author'>Danh mục: <a href='#'>Món {currentFood?.categoryId}</a></div>
                                <div className='title'>{currentFood?.name}</div>
                                <div className='rating'>
                                    <Rate value={5} disabled style={{ color: '#ffce3d', fontSize: 12 }} />
                                    <span className='sold'>
                                        <Divider type="vertical" />
                                        Còn {currentFood?.stockQty ?? 0} món
                                    </span>
                                </div>
                                <div className='price'>
                                    <span className='currency'>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentFood?.price ?? 0)}
                                    </span>
                                </div>
                                {currentFood?.description && (
                                    <div className='delivery'>
                                        <div>
                                            <span className='left'>Mô tả</span>
                                            <span className='right'>{currentFood.description}</span>
                                        </div>
                                    </div>
                                )}
                                <div className='delivery'>
                                    <div>
                                        <span className='left'>Vận chuyển</span>
                                        <span className='right'>Miễn phí vận chuyển</span>
                                    </div>
                                </div>
                                <div className='delivery'>
                                    <div>
                                        <span className='left'>Trạng thái</span>
                                        <span className='right' style={{ color: currentFood?.isAvailable ? 'green' : 'red' }}>
                                            {currentFood?.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                                        </span>
                                    </div>
                                </div>
                                <div className='quantity'>
                                    <span className='left'>Số lượng</span>
                                    <span className='right'>
                                        <button onClick={() => handleChangeButton('MINUS')}><MinusOutlined /></button>
                                        <input onChange={(event) => handleChangeInput(event.target.value)} value={currentQuantity} />
                                        <button onClick={() => handleChangeButton('PLUS')}><PlusOutlined /></button>
                                    </span>
                                </div>
                                <div className='buy'>
                                    <button
                                        className='cart'
                                        onClick={() => handleAddToCart()}
                                        disabled={!currentFood?.isAvailable}
                                    >
                                        <BsCartPlus className='icon-cart' />
                                        <span>Thêm vào giỏ hàng</span>
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(true)}
                                        className='now'
                                        disabled={!currentFood?.isAvailable}
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </div>
            </div>
            <ModalGallery
                isOpen={isOpenModalGallery}
                setIsOpen={setIsOpenModalGallery}
                currentIndex={currentIndex}
                items={imageGallery}
                title={currentFood?.name ?? ''}
            />
        </div>
    );
};

export default BookDetail;
