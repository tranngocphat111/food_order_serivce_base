import MobileFilter from '@/components/client/book/mobile.filter';
import { getFoodsAPI, getCategoryAPI } from '@/services/api';
import { FilterTwoTone, ReloadOutlined } from '@ant-design/icons';
import {
    Row, Col, Form, Checkbox, Divider, InputNumber,
    Button, Rate, Tabs, Pagination, Spin
} from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import 'styles/home.scss';
import { Image } from 'antd';
import { resolveFoodImageUrl } from '@/services/helper';

type FieldType = {
    range: {
        from: number;
        to: number
    }
    category: string[]
};


const HomePage = () => {
    const [searchTerm] = useOutletContext() as any;

    const [listCategory, setListCategory] = useState<{
        label: string, value: string
    }[]>([]);

    const [listFood, setListFood] = useState<IFood[]>([]);
    const [filteredFoods, setFilteredFoods] = useState<IFood[]>([]);
    const [current, setCurrent] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>("");
    const [sortQuery, setSortQuery] = useState<string>("sort=-sold");
    const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

    const [form] = Form.useForm();

    const navigate = useNavigate();

    useEffect(() => {
        const initCategory = async () => {
            const res = await getCategoryAPI();
            if (res && res.data) {
                const d = res.data.map(item => {
                    return { label: item, value: item }
                })
                setListCategory(d);
            }
        }
        initCategory();
    }, []);

    useEffect(() => {
        fetchFoods();
    }, []);

    useEffect(() => {
        // Apply filtering and sorting whenever dependencies change
        applyFiltersAndSort();
    }, [listFood, filter, sortQuery, searchTerm, current, pageSize]);

    const fetchFoods = async () => {
        setIsLoading(true);
        try {
            const res = await getFoodsAPI();
            const foods = Array.isArray(res) ? res : [];
            setListFood(foods);
            setTotal(foods.length);
        } catch (error) {
            console.error('Error fetching foods:', error);
            setListFood([]);
        }
        setIsLoading(false);
    }

    const applyFiltersAndSort = () => {
        let result = [...listFood];

        // Filter by search term
        if (searchTerm) {
            result = result.filter(food => 
                food.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (filter.includes('category=')) {
            const categoryMatch = filter.match(/category=([^&]+)/);
            if (categoryMatch) {
                const categories = categoryMatch[1].split(',');
                result = result.filter(food => 
                    categories.includes(String(food.categoryId))
                );
            }
        }

        // Filter by price range
        const priceFromMatch = filter.match(/price>=(\d+)/);
        const priceToMatch = filter.match(/price<=(\d+)/);
        if (priceFromMatch) {
            const minPrice = parseInt(priceFromMatch[1]);
            result = result.filter(food => food.price >= minPrice);
        }
        if (priceToMatch) {
            const maxPrice = parseInt(priceToMatch[1]);
            result = result.filter(food => food.price <= maxPrice);
        }

        // Filter only available items
        result = result.filter(food => food.isAvailable);

        // Apply sorting
        if (sortQuery.includes('-price')) {
            result.sort((a, b) => b.price - a.price);
        } else if (sortQuery.includes('price')) {
            result.sort((a, b) => a.price - b.price);
        } else if (sortQuery.includes('-updatedAt')) {
            result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }

        setTotal(result.length);

        // Apply pagination
        const startIndex = (current - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        setFilteredFoods(result.slice(startIndex, endIndex));
    }

    const handleOnchangePage = (pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }

    }


    const handleChangeFilter = (changedValues: any, values: any) => {
        if (changedValues.category) {
            const cate = values.category;
            if (cate && cate.length > 0) {
                const f = cate.join(',');
                setFilter(`category=${f}`)
            } else {
                setFilter('');
            }
        }

    }

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        if (values?.range?.from >= 0 && values?.range?.to >= 0) {
            let f = `price>=${values?.range?.from}&price<=${values?.range?.to}`;
            if (values?.category?.length) {
                const cate = values?.category?.join(',');
                f += `&category=${cate}`
            }
            setFilter(f);
        }

    }

    const onChange = (key: string) => {
        // console.log(key);
    };

    const items = [
        {
            key: "sort=-sold",
            label: `Phổ biến`,
            children: <></>,
        },
        {
            key: 'sort=-updatedAt',
            label: `Món Mới`,
            children: <></>,
        },
        {
            key: 'sort=price',
            label: `Giá Thấp Đến Cao`,
            children: <></>,
        },
        {
            key: 'sort=-price',
            label: `Giá Cao Đến Thấp`,
            children: <></>,
        },
    ];


    return (
        <>
            <div className="page-surface" style={{ padding: "24px 0" }}>
                <div className="homepage-container" style={{ maxWidth: 1440, margin: '0 auto', overflow: "hidden" }}>
                    <Row gutter={[20, 20]}>
                        <Col md={4} sm={0} xs={0}>
                            <div style={{ padding: "20px", background: 'rgba(255,255,255,0.92)', borderRadius: 18, border: '1px solid var(--border-soft)' }}>
                                <div style={{ display: 'flex', justifyContent: "space-between" }}>
                                    <span> <FilterTwoTone />
                                        <span style={{ fontWeight: 500 }}> Bộ lọc tìm kiếm</span>
                                    </span>
                                    <ReloadOutlined title="Reset" onClick={() => {
                                        form.resetFields();
                                        setFilter('');
                                    }}
                                    />
                                </div>
                                <Divider />
                                <Form
                                    onFinish={onFinish}
                                    form={form}
                                    onValuesChange={(changedValues, values) => handleChangeFilter(changedValues, values)}
                                >
                                    <Form.Item
                                        name="category"
                                        label="Danh mục món ăn"
                                        labelCol={{ span: 24 }}
                                    >
                                        <Checkbox.Group>
                                            <Row>
                                                {listCategory?.map((item, index) => {
                                                    return (
                                                        <Col span={24} key={`index-${index}`} style={{ padding: '7px 0' }}>
                                                            <Checkbox value={item.value} >
                                                                {item.label}
                                                            </Checkbox>
                                                        </Col>
                                                    )
                                                })}
                                            </Row>
                                        </Checkbox.Group>
                                    </Form.Item>
                                    <Divider />
                                    <Form.Item
                                        label="Khoảng giá"
                                        labelCol={{ span: 24 }}
                                    >
                                        <Row gutter={[10, 10]} style={{ width: "100%" }}>
                                            <Col xl={11} md={24}>
                                                <Form.Item name={["range", 'from']}>
                                                    <InputNumber
                                                        name='from'
                                                        min={0}
                                                        placeholder="đ TỪ"
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xl={2} md={0}>
                                                <div > - </div>
                                            </Col>
                                            <Col xl={11} md={24}>
                                                <Form.Item name={["range", 'to']}>
                                                    <InputNumber
                                                        name='to'
                                                        min={0}
                                                        placeholder="đ ĐẾN"
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <div>
                                            <Button onClick={() => form.submit()}
                                                style={{ width: "100%" }} type='primary'>Áp dụng</Button>
                                        </div>
                                    </Form.Item>
                                    <Divider />
                                    <Form.Item
                                        label="Đánh giá"
                                        labelCol={{ span: 24 }}
                                    >
                                        <div>
                                            <Rate value={5} disabled style={{ color: '#ffce3d', fontSize: 15 }} />
                                            <span className="ant-rate-text"></span>
                                        </div>
                                        <div>
                                            <Rate value={4} disabled style={{ color: '#ffce3d', fontSize: 15 }} />
                                            <span className="ant-rate-text">trở lên</span>
                                        </div>
                                        <div>
                                            <Rate value={3} disabled style={{ color: '#ffce3d', fontSize: 15 }} />
                                            <span className="ant-rate-text">trở lên</span>
                                        </div>
                                        <div>
                                            <Rate value={2} disabled style={{ color: '#ffce3d', fontSize: 15 }} />
                                            <span className="ant-rate-text">trở lên</span>
                                        </div>
                                        <div>
                                            <Rate value={1} disabled style={{ color: '#ffce3d', fontSize: 15 }} />
                                            <span className="ant-rate-text">trở lên</span>
                                        </div>
                                    </Form.Item>
                                </Form>
                            </div>
                        </Col>

                        <Col md={20} xs={24} >
                            <Spin spinning={isLoading} tip="Loading...">
                                <div style={{ padding: "20px", background: 'rgba(255,255,255,0.92)', borderRadius: 18, border: '1px solid var(--border-soft)' }}>
                                    <Row >
                                        <Tabs
                                            defaultActiveKey="sort=-sold"
                                            items={items}
                                            onChange={(value) => { setSortQuery(value) }}
                                            style={{ overflowX: "auto" }}
                                        />
                                        <Col xs={24} md={0}>
                                            <div style={{ marginBottom: 20 }} >
                                                <span onClick={() => setShowMobileFilter(true)}>
                                                    <FilterTwoTone />
                                                    <span style={{ fontWeight: 500 }}> Lọc</span>
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className='customize-row'>
                                        {filteredFoods?.map((item, index) => {
                                            return (
                                                <div
                                                    onClick={() => navigate(`/food/${item.id}`)}
                                                    className="column" key={`food-${index}`}>
                                                    <div className='wrapper'>
                                                        <div className='thumbnail'>
                                                            <img 
                                                                src={resolveFoodImageUrl(item.imageUrl)} 
                                                                alt={item.name}
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = '/default-food.png';
                                                                }}
                                                            />
                                                        </div>
                                                        <div className='text' title={item.name}>{item.name}</div>
                                                        <div className='price'>
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.price ?? 0)}
                                                        </div>
                                                        <div className='rating'>
                                                            <Rate value={5} disabled style={{ color: '#ffce3d', fontSize: 10 }} />
                                                            <span>Còn {item?.stockQty ?? 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </Row>
                                    <div style={{ marginTop: 30 }}></div>
                                    <Row style={{ display: "flex", justifyContent: "center" }}>
                                        <Pagination
                                            current={current}
                                            total={total}
                                            pageSize={pageSize}
                                            responsive
                                            onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                                        />
                                    </Row>
                                </div>
                            </Spin>
                        </Col>
                    </Row>
                </div>
            </div>
            <MobileFilter
                isOpen={showMobileFilter}
                setIsOpen={setShowMobileFilter}
                handleChangeFilter={handleChangeFilter}
                listCategory={listCategory}
                onFinish={onFinish}
            />
        </>
    )
}

export default HomePage;