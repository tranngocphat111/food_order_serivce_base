export { };

declare global {
    // Generic backend response (for compatibility)
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
        success?: boolean;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        },
        result: T[]
    }

    // User Service Response
    interface ILoginResponse {
        userId: number;
        username: string;
        email: string;
        token: string;
        success: boolean;
        message: string;
    }

    interface ILogin {
        access_token: string;
        user: IUser;
    }

    interface IRegisterResponse {
        userId: number;
        username: string;
        email: string;
        token: string;
        success: boolean;
        message: string;
    }

    interface IRegister {
        _id: string;
        email: string;
        fullName: string;
    }

    interface IUser {
        id: number;
        username: string;
        email: string;
        fullName: string;
        role: string;
        active: boolean;
        createdAt?: string;
        phone?: string;
        avatar?: string;
    }

    interface IFetchAccount {
        user: IUser
    }

    interface IUserTable {
        id: number;
        username: string;
        fullName: string;
        email: string;
        phone?: string;
        role: string;
        active: boolean;
        createdAt: string;
        updatedAt?: string;
    }

    interface IResponseImport {
        countSuccess: number;
        countError: number;
        detail: any;
    }

    // Food Entity (from FoodServices)
    interface IFood {
        id: number;
        name: string;
        description: string;
        price: number;
        categoryId: number;
        imageUrl: string | null;
        isAvailable: boolean;
        stockQty: number;
        createdAt: string;
        updatedAt: string;
    }

    // Category for filtering
    interface ICategory {
        id: number;
        name: string;
    }

    // Cart item for food ordering
    interface ICart {
        id: number;
        quantity: number;
        detail: IFood;
    }

    // Order Item for creating orders
    interface IOrderItem {
        foodId: number;
        quantity: number;
    }

    // Create Order Request
    interface ICreateOrderRequest {
        userId: number;
        items: IOrderItem[];
        note?: string;
        deliveryAddress: string;
    }

    // Order Item Response (from order-service)
    interface IOrderItemResponse {
        foodId: number;
        foodName: string;
        price: number;
        quantity: number;
    }

    // Order Response
    interface IOrderResponse {
        id: number;
        orderCode: string;
        userId: number;
        userName: string;
        items: IOrderItemResponse[];
        totalAmount: number;
        status: string;
        note: string;
        deliveryAddress: string;
        createdAt: string;
        updatedAt: string;
    }

    // Payment Methods
    type PaymentMethod = 'COD' | 'BANKING';

    // Payment Request
    interface IPaymentRequest {
        orderId: number;
        userId: number;
        paymentMethod: PaymentMethod;
    }

    // Payment Response
    interface IPaymentResponse {
        paymentId: number;
        orderId: number;
        userId: number;
        paymentMethod: PaymentMethod;
        paymentStatus: 'SUCCESS' | 'FAILED';
        paidAt: string;
        message: string;
    }

    interface IPaymentNotificationEvent {
        id: number;
        userId: number;
        orderId: number;
        paymentId: number;
        type: 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED';
        message: string;
        isRead: boolean;
        createdAt: string;
    }

    // Order Status
    type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

    // Order Table (for admin management)
    interface IOrderTable extends IOrderResponse { }

    // History (user's order history)
    interface IHistory extends IOrderResponse { }

    // Legacy support - keeping IBookTable as alias for IFood during transition
    interface IBookTable extends IFood {
        _id?: string;
        thumbnail?: string;
        slider?: string[];
        mainText?: string;
        author?: string;
        sold?: number;
        category?: string;
    }
}
