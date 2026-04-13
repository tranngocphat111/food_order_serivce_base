import { createFoodAPI, deleteFoodAPI, deleteFoodImageAPI, getFoodsAPI, updateFoodAPI, uploadFoodImageAPI } from '@/services/api';
import { App, Button, Card, Col, Drawer, Form, Image, Input, InputNumber, Modal, Popconfirm, Row, Select, Space, Table, Tag, Typography, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { UploadFile } from 'antd';
import { MAX_UPLOAD_IMAGE_SIZE, resolveFoodImageUrl } from '@/services/helper';

const FOOD_CATEGORIES = [
  { value: 1, label: 'Món chính' },
  { value: 2, label: 'Đồ uống' },
  { value: 3, label: 'Món phụ' },
  { value: 4, label: 'Tráng miệng' },
  { value: 5, label: 'Combo' }
];

const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
});

type FoodFormValues = {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  stockQty: number;
  isAvailable: boolean;
};

const AdminFoodPage = () => {
  const { message, notification } = App.useApp();
  const [form] = Form.useForm<FoodFormValues>();
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState<IFood[]>([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'hidden'>('all');
  const [openModal, setOpenModal] = useState(false);
  const [editingFood, setEditingFood] = useState<IFood | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedFood, setSelectedFood] = useState<IFood | null>(null);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

  const handleBeforeUpload = (file: File) => {
    const isValidSize = file.size / 1024 / 1024 <= MAX_UPLOAD_IMAGE_SIZE;
    if (!isValidSize) {
      message.error(`Ảnh tối đa ${MAX_UPLOAD_IMAGE_SIZE}MB`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const loadFoods = async () => {
    setLoading(true);
    try {
      const res = await getFoodsAPI();
      setFoods(Array.isArray(res) ? res : []);
    } catch (error: any) {
      notification.error({
        message: 'Không tải được danh sách món ăn',
        description: error?.message || 'Vui lòng thử lại sau'
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchedText = `${food.name} ${food.description}`.toLowerCase().includes(searchText.toLowerCase());
      const matchedCategory = categoryFilter ? food.categoryId === categoryFilter : true;
      const matchedStatus =
        statusFilter === 'all' ? true : statusFilter === 'available' ? food.isAvailable : !food.isAvailable;
      return matchedText && matchedCategory && matchedStatus;
    });
  }, [foods, searchText, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const available = foods.filter((food) => food.isAvailable).length;
    const lowStock = foods.filter((food) => Number(food.stockQty || 0) <= 10).length;
    const averagePrice = foods.length > 0
      ? foods.reduce((sum, food) => sum + Number(food.price || 0), 0) / foods.length
      : 0;
    return { available, lowStock, averagePrice };
  }, [foods]);

  const openCreateModal = () => {
    setEditingFood(null);
    form.resetFields();
    form.setFieldsValue({
      price: 0,
      stockQty: 1,
      categoryId: 1,
      isAvailable: true,
      description: ''
    });
    setImageFileList([]);
    setOpenModal(true);
  };

  const openEditModal = (food: IFood) => {
    setEditingFood(food);
    form.setFieldsValue({
      name: food.name,
      description: food.description,
      price: Number(food.price || 0),
      categoryId: food.categoryId,
      stockQty: Number(food.stockQty || 0),
      isAvailable: Boolean(food.isAvailable)
    });
    setImageFileList(
      food.imageUrl
        ? [{
          uid: String(food.id),
          name: food.imageUrl,
          status: 'done',
          url: resolveFoodImageUrl(food.imageUrl)
        }]
        : []
    );
    setOpenModal(true);
  };

  const handleSubmit = async (values: FoodFormValues) => {
    const payload: Partial<IFood> = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      categoryId: Number(values.categoryId),
      stockQty: Number(values.stockQty),
      isAvailable: Boolean(values.isAvailable)
    };

    try {
      const selectedImage = imageFileList.find((file) => file.originFileObj)?.originFileObj as File | undefined;

      if (editingFood) {
        await updateFoodAPI(editingFood.id, payload);

        if (selectedImage) {
          await uploadFoodImageAPI(editingFood.id, selectedImage);
        } else if (imageFileList.length === 0 && editingFood.imageUrl) {
          await deleteFoodImageAPI(editingFood.id);
        }

        message.success('Cập nhật món ăn thành công');
      } else {
        const createdFood = await createFoodAPI(payload) as IFood;
        if (selectedImage && createdFood?.id) {
          await uploadFoodImageAPI(createdFood.id, selectedImage);
        }
        message.success('Tạo món ăn mới thành công');
      }

      setOpenModal(false);
      setEditingFood(null);
      form.resetFields();
      setImageFileList([]);
      await loadFoods();
    } catch (error: any) {
      notification.error({
        message: 'Đã có lỗi xảy ra',
        description: error?.message || 'Không thể lưu món ăn'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFoodAPI(id);
      message.success('Xóa món ăn thành công');
      await loadFoods();
    } catch (error: any) {
      notification.error({
        message: 'Không xóa được món ăn',
        description: error?.message || 'Vui lòng thử lại sau'
      });
    }
  };

  const columns: ColumnsType<IFood> = [
    {
      title: 'Mã',
      dataIndex: 'id',
      width: 90,
      render: (value, record) => (
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setSelectedFood(record);
            setOpenDrawer(true);
          }}
        >
          #{value}
        </a>
      )
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      width: 100,
      render: (value, record) => (
        <Image
          width={56}
          height={56}
          style={{ objectFit: 'cover', borderRadius: 14 }}
          src={resolveFoodImageUrl(value)}
          alt={record.name}
          preview={false}
        />
      )
    },
    {
      title: 'Tên món',
      dataIndex: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      render: (value) => FOOD_CATEGORIES.find((item) => item.value === value)?.label || `#${value}`
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      render: (value) => currency.format(Number(value || 0))
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockQty'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isAvailable',
      render: (value) => (
        <Tag color={value ? 'green' : 'red'}>{value ? 'Đang bán' : 'Ngưng bán'}</Tag>
      )
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      render: (value) => dayjs(value).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      width: 180,
      render: (_, record) => (
        <Space size={8}>
          <Button icon={<EyeOutlined />} onClick={() => {
            setSelectedFood(record);
            setOpenDrawer(true);
          }}>
            Xem
          </Button>
          <Button icon={<EditOutlined />} type="primary" ghost onClick={() => openEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa món ăn"
            description="Bạn chắc chắn muốn xóa món ăn này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
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
              Quản lý món ăn
            </Typography.Title>
            <p>
              Tạo, cập nhật và ẩn hiện món ăn trong một giao diện rõ ràng, hiện đại và tập trung vào thao tác nhanh.
            </p>
            <div className="admin-hero__chips">
              <span className="admin-hero__chip">CRUD đầy đủ</span>
              <span className="admin-hero__chip">Ảnh đại diện</span>
              <span className="admin-hero__chip">Bộ lọc thông minh</span>
            </div>
          </div>
          <Card className="admin-card" style={{ borderRadius: 22 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <strong style={{ fontSize: 16, color: '#0f172a' }}>Tổng quan nhanh</strong>
              <Space wrap>
                <Tag color="blue">Tổng: {foods.length}</Tag>
                <Tag color="green">Đang bán: {stats.available}</Tag>
                <Tag color="orange">Sắp hết hàng: {stats.lowStock}</Tag>
              </Space>
              <span style={{ color: '#64748b' }}>
                Giá trung bình: {currency.format(stats.averagePrice || 0)}
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
              placeholder="Tìm theo tên hoặc mô tả"
              style={{ width: 280 }}
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <Select
              allowClear
              placeholder="Danh mục"
              style={{ width: 180 }}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={FOOD_CATEGORIES}
            />
            <Select
              style={{ width: 180 }}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Đang bán', value: 'available' },
                { label: 'Ngưng bán', value: 'hidden' }
              ]}
            />
          </div>
          <div className="admin-toolbar__actions">
            <Button icon={<ReloadOutlined />} onClick={loadFoods}>
              Tải lại
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm món mới
            </Button>
          </div>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredFoods}
          pagination={{ pageSize: 8, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editingFood ? 'Cập nhật món ăn' : 'Tạo món ăn mới'}
        open={openModal}
        onCancel={() => {
          setOpenModal(false);
          setEditingFood(null);
          form.resetFields();
          setImageFileList([]);
        }}
        onOk={() => form.submit()}
        okText={editingFood ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
        width={720}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên món"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên món' }]}
              >
                <Input placeholder="Ví dụ: Cơm gà xối mỡ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select options={FOOD_CATEGORIES} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giá bán"
                name="price"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter="đ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tồn kho"
                name="stockQty"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả món ăn' }]}
              >
                <Input.TextArea rows={4} placeholder="Mô tả ngắn gọn về món ăn" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Ảnh món ăn">
                <Upload
                  listType="picture-card"
                  fileList={imageFileList}
                  beforeUpload={handleBeforeUpload}
                  maxCount={1}
                  onChange={({ fileList }) => setImageFileList(fileList)}
                  accept="image/*"
                >
                  {imageFileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="isAvailable">
                <Select
                  options={[
                    { label: 'Đang bán', value: true },
                    { label: 'Ngưng bán', value: false }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết món ăn"
        open={openDrawer}
        width={520}
        onClose={() => {
          setOpenDrawer(false);
          setSelectedFood(null);
        }}
      >
        {selectedFood && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card className="admin-card">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Typography.Title level={4} style={{ marginBottom: 0 }}>
                  {selectedFood.name}
                </Typography.Title>
                <Tag color={selectedFood.isAvailable ? 'green' : 'red'}>
                  {selectedFood.isAvailable ? 'Đang bán' : 'Ngưng bán'}
                </Tag>
                {selectedFood.imageUrl && (
                  <Image src={resolveFoodImageUrl(selectedFood.imageUrl)} alt={selectedFood.name} style={{ borderRadius: 18 }} />
                )}
              </Space>
            </Card>
            <div className="admin-detail-list">
              <div className="admin-item">
                <div className="admin-item__title">
                  <span>Giá bán</span>
                  <span>{currency.format(Number(selectedFood.price || 0))}</span>
                </div>
                <div className="admin-item__desc">Danh mục #{selectedFood.categoryId}</div>
              </div>
              <div className="admin-item">
                <div className="admin-item__title">
                  <span>Tồn kho</span>
                  <span>{selectedFood.stockQty}</span>
                </div>
                <div className="admin-item__desc">Cập nhật lúc {dayjs(selectedFood.updatedAt).format('DD/MM/YYYY HH:mm')}</div>
              </div>
              <div className="admin-item">
                <div className="admin-item__title">
                  <span>Mô tả</span>
                </div>
                <div className="admin-item__desc">{selectedFood.description}</div>
              </div>
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AdminFoodPage;