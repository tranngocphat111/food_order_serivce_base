import { Button, Divider, Form, Input, App } from 'antd';
import type { FormProps } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './register.scss';
import { registerAPI } from '@/services/api';

type FieldType = {
    username: string;
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

const RegisterPage = () => {
    const [isSubmit, setIsSubmit] = useState(false);
    const { message, notification } = App.useApp();
    const navigate = useNavigate();

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        const { username, email, password, fullName } = values;

        try {
            const res = await registerAPI(username, email, password, fullName) as any;
            
            if (res?.success === true || res?.userId) {
                message.success("Đăng ký tài khoản thành công!");
                navigate("/login");
            } else {
                notification.error({
                    message: "Có lỗi xảy ra",
                    description: res?.message || 'Đăng ký thất bại',
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
    };

    return (
        <div className="register-page">
            <main className="main">
                <div className="container">
                    <section className="wrapper">
                        <div className="heading">
                            <h2 className="text text-large">Đăng Ký Tài Khoản</h2>
                            <Divider />
                        </div>
                        <Form
                            name="form-register"
                            onFinish={onFinish}
                            autoComplete="off"
                        >
                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Tên đăng nhập"
                                name="username"
                                rules={[
                                    { required: true, message: 'Tên đăng nhập không được để trống!' },
                                    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                                ]}
                            >
                                <Input placeholder="Nhập tên đăng nhập" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Họ tên"
                                name="fullName"
                                rules={[{ required: true, message: 'Họ tên không được để trống!' }]}
                            >
                                <Input placeholder="Nhập họ và tên" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Email không được để trống!' },
                                    { type: "email", message: "Email không đúng định dạng!" }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Mật khẩu"
                                name="password"
                                rules={[
                                    { required: true, message: 'Mật khẩu không được để trống!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                labelCol={{ span: 24 }}
                                label="Xác nhận mật khẩu"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Nhập lại mật khẩu" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={isSubmit}>
                                    Đăng ký
                                </Button>
                            </Form.Item>
                            <Divider />
                            <p className="text text-normal" style={{ textAlign: "center" }}>
                                Đã có tài khoản ?
                                <span>
                                    <Link to='/login' > Đăng Nhập </Link>
                                </span>
                            </p>
                        </Form>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default RegisterPage;