import { useEffect, useState } from 'react';
import {
    AppstoreOutlined,
    CoffeeOutlined,
    HeartTwoTone,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ShoppingOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Space, Tag } from 'antd';
import { Navigate, Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useCurrentApp } from '../context/app.context';
import type { MenuProps } from 'antd';
import { logoutAPI } from '@/services/api';
import { isAdminRole, normalizeRole } from '@/services/helper';
import 'styles/admin.scss';
type MenuItem = Required<MenuProps>['items'][number];

const { Content, Footer, Sider } = Layout;


const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const navigate = useNavigate();
    const {
        user, setUser, setIsAuthenticated, isAuthenticated,
        setCarts
    } = useCurrentApp();

    const location = useLocation();

    const items: MenuItem[] = [
        {
            label: <Link to='/admin'>Dashboard</Link>,
            key: '/admin',
            icon: <AppstoreOutlined />,

        },
        {
            label: <Link to='/admin/foods'>Foods</Link>,
            key: '/admin/foods',
            icon: <CoffeeOutlined />
        },
        {
            label: <Link to='/admin/orders'>Orders</Link>,
            key: '/admin/orders',
            icon: <ShoppingOutlined />
        },

    ];


    useEffect(() => {
        if (location.pathname.startsWith('/admin/orders') || location.pathname.startsWith('/admin/order')) {
            setActiveMenu('/admin/orders');
            return;
        }

        if (location.pathname.startsWith('/admin/foods') || location.pathname.startsWith('/admin/food') || location.pathname.startsWith('/admin/book')) {
            setActiveMenu('/admin/foods');
            return;
        }

        setActiveMenu('/admin');
    }, [location.pathname]);

    const handleLogout = async () => {
        const res = await logoutAPI();
        if (res.data) {
            setUser(null);
            setCarts([]);
            setIsAuthenticated(false);
            localStorage.removeItem("access_token");
            localStorage.removeItem("carts")
            navigate('/login');
        }
    }


    const itemsDropdown = [
        {
            label: <span>Quản lý tài khoản</span>,
            key: 'account',
        },
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <span style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>Đăng xuất</span>,
            key: 'logout',
        },

    ];

    const hasAvatar = !!user?.avatar;
    const urlAvatar = hasAvatar
        ? `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`
        : undefined;

    if (isAuthenticated === false) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdminRole(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return (
        <Layout className="admin-shell">
            <Sider
                width={280}
                theme="dark"
                collapsible
                collapsed={collapsed}
                trigger={null}
            >
                <div className="admin-sidebar">
                    <div className="admin-brand">
                        <div className="admin-brand__logo">F</div>
                        {!collapsed && (
                            <div className="admin-brand__text">
                                <strong>FoodFlow Admin</strong>
                                <span>Operate faster, cleaner</span>
                            </div>
                        )}
                    </div>

                    <Menu
                        selectedKeys={[activeMenu]}
                        mode="inline"
                        items={items}
                        onClick={(e) => setActiveMenu(e.key)}
                    />
                </div>
            </Sider>

            <Layout className="admin-shell__body">
                <div className='admin-topbar'>
                    <div className="admin-topbar__title">
                        <strong>
                            {activeMenu === '/admin/orders'
                                ? 'Quản lý đơn hàng'
                                : activeMenu === '/admin/foods'
                                    ? 'Quản lý món ăn'
                                    : 'Bảng điều khiển'}
                        </strong>
                        <span>Giao diện quản trị mới, đồng bộ với toàn app</span>
                    </div>
                    <div className="admin-topbar__actions">
                        <Button
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? 'Mở menu' : 'Thu gọn'}
                        </Button>
                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar src={urlAvatar} icon={!hasAvatar ? <UserOutlined /> : undefined} />
                                <span>{user?.fullName || 'Administrator'}</span>
                                <Tag color="orange">{normalizeRole(user?.role || 'ADMIN')}</Tag>
                            </Space>
                        </Dropdown>
                    </div>
                </div>

                <Content className="admin-content">
                    <Outlet />
                </Content>

                <Footer style={{ padding: 16, textAlign: 'center', background: 'transparent', color: '#64748b' }}>
                    FoodFlow Admin &copy; Made with <HeartTwoTone />
                </Footer>
            </Layout>
        </Layout>
    );
};

export default LayoutAdmin;