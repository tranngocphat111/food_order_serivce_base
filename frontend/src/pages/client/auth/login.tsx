import { App, Button, Divider, Form, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './login.scss';
import { useState } from 'react';
import type { FormProps } from 'antd';
import { loginAPI, verifyTokenAPI } from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';

type FieldType = {
    username: string;
    password: string;
};

const LoginPage = () => {
    const navigate = useNavigate();
    const [isSubmit, setIsSubmit] = useState(false);
    const { message, notification } = App.useApp();
    const { setIsAuthenticated, setUser } = useCurrentApp();

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { username, password } = values;
        setIsSubmit(true);
        
        try {
            const res = await loginAPI(username, password) as any;
            setIsSubmit(false);
            
            // Handle response from user-service
            if (res?.success === true || res?.token) {
                let verifyRes: ITokenVerifyResponse | null = null;
                try {
                    verifyRes = await verifyTokenAPI(res.token) as ITokenVerifyResponse;
                } catch {
                    verifyRes = null;
                }
                const user: IUser = {
                    id: verifyRes?.userId ?? res.userId,
                    username: verifyRes?.username ?? res.username,
                    email: verifyRes?.email ?? res.email,
                    fullName: res.fullName || verifyRes?.username || res.username,
                    role: (verifyRes?.role || res.role || 'USER').replace('ROLE_', ''),
                    active: true
                };
                
                setIsAuthenticated(true);
                setUser(user);
                localStorage.setItem('access_token', res.token);
                localStorage.setItem('user', JSON.stringify(user));
                message.success('Đăng nhập tài khoản thành công!');
                if (user.role === 'ADMIN') {
                    navigate('/admin');
                    return;
                }
                navigate('/');
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || 'Đăng nhập thất bại',
                    duration: 5
                });
            }
        } catch (error: any) {
            setIsSubmit(false);
            notification.error({
                message: "Có lỗi xảy ra",
                description: error?.message || 'Không thể kết nối đến server',
                duration: 5
            });
        }
    };

    return (
        <div className="login-page">
            <main className="main">
                <div className="container">
                    <section className="wrapper">
                        <div className="heading">
                            <h2 className="text text-large">Đăng Nhập</h2>
                            <Divider />

                        </div>
                        <Form
                            name="login-form"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Tên đăng nhập"
                                name="username"
                                rules={[
                                    { required: true, message: 'Tên đăng nhập không được để trống!' }
                                ]}
                            >
                                <Input placeholder="Nhập tên đăng nhập" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={[{ required: true, message: 'Mật khẩu không được để trống!' }]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={isSubmit}>
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                            <Divider />

                            <p className="text text-normal" style={{ textAlign: "center" }}>
                                Chưa có tài khoản ?
                                <span>
                                    <Link to='/register' > Đăng Ký </Link>
                                </span>
                            </p>
                            <br />
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default LoginPage;
