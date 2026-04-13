import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from '@/layout';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import BookPage from 'pages/client/book';
import AboutPage from 'pages/client/about';
import LoginPage from 'pages/client/auth/login';
import RegisterPage from 'pages/client/auth/register';
import 'styles/global.scss'
import 'styles/admin.scss'
import HomePage from 'pages/client/home';
import { App, ConfigProvider } from 'antd';
import { AppProvider } from 'components/context/app.context';
import ProtectedRoute from '@/components/auth';
import LayoutAdmin from 'components/layout/layout.admin';
import OrderPage from 'pages/client/order';
import HistoryPage from 'pages/client/history';
import AdminDashboardPage from 'pages/admin/dashboard';
import AdminFoodPage from 'pages/admin/manage.food';
import AdminOrderPage from 'pages/admin/manage.order';

import viVN from 'antd/locale/vi_VN';
import ReturnURLPage from 'components/client/order/return.url';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "/food/:id",
        element: <BookPage />,
      },
      {
        path: "/book/:id",
        element: <BookPage />,
      },
      {
        path: "/order",
        element: (
          <ProtectedRoute>
            <OrderPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/history",
        element: (
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vnpay/return-url",
        element: (
          <ProtectedRoute>
            <ReturnURLPage />
          </ProtectedRoute>
        )
      },
    ]
  },
  {
    path: "admin",
    element: <LayoutAdmin />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />
      },
      {
        path: "foods",
        element: <AdminFoodPage />
      },
      {
        path: "food",
        element: <AdminFoodPage />
      },
      {
        path: "orders",
        element: <AdminOrderPage />
      },
      {
        path: "order",
        element: <AdminOrderPage />
      },

    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <AppProvider>
        <ConfigProvider
          locale={viVN}
          theme={{
            token: {
              colorPrimary: '#ef6c2f',
              colorInfo: '#ef6c2f',
              colorSuccess: '#2f9e5a',
              colorWarning: '#d98a27',
              borderRadius: 12,
              fontFamily: 'Inter, Segoe UI, Helvetica Neue, Arial, sans-serif'
            },
            components: {
              Layout: {
                bodyBg: '#f8f1e9'
              },
              Tabs: {
                itemActiveColor: '#ef6c2f',
                itemSelectedColor: '#ef6c2f',
                inkBarColor: '#ef6c2f'
              },
              Button: {
                colorPrimary: '#ef6c2f',
                colorPrimaryHover: '#dc5f22'
              },
              Pagination: {
                colorPrimary: '#ef6c2f',
                colorPrimaryHover: '#dc5f22'
              }
            }
          }}
        >
          <RouterProvider router={router} />
        </ConfigProvider>
      </AppProvider>
    </App>
  </StrictMode>,
)
