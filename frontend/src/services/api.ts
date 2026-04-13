import createInstanceAxios from 'services/axios.customize';


// Keep aliases to avoid changing call-sites across this file
const gatewayAxios = createInstanceAxios('/');
const userAxios = gatewayAxios;
const foodAxios = gatewayAxios;
const orderAxios = gatewayAxios;
const paymentAxios = gatewayAxios;

// ==================== USER SERVICE APIs ====================

// Login API - User Service
export const loginAPI = (username: string, password: string) => {
    const urlBackend = "/api/users/login";
    return userAxios.post<ILoginResponse>(urlBackend, { username, password });
}

// Register API - User Service
export const registerAPI = (username: string, email: string, password: string, fullName: string) => {
    const urlBackend = "/api/users/register";
    return userAxios.post<IRegisterResponse>(urlBackend, {
        username,
        email,
        password,
        confirmPassword: password,
        fullName
    });
}

// Verify Token API - User Service
export const verifyTokenAPI = (token: string) => {
    const urlBackend = "/api/users/verify-token";
    return userAxios.post<ITokenVerifyResponse>(urlBackend, token, {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}

// Get current user info from token
export const fetchAccountAPI = () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        const user = JSON.parse(userStr);
        return Promise.resolve({
            data: { user },
            statusCode: 200,
            message: 'success'
        } as IBackendRes<IFetchAccount>);
    }
    return Promise.resolve({
        data: undefined,
        statusCode: 401,
        message: 'Not authenticated'
    } as IBackendRes<IFetchAccount>);
}

// Logout API - clear local storage
export const logoutAPI = () => {
    return userAxios.post('/api/users/logout', {})
        .catch(() => null)
        .finally(() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            localStorage.removeItem('carts');
        })
        .then(() => ({
            data: true,
            statusCode: 200,
            message: 'Logged out successfully'
        }));
}

// Get all users - User Service
export const getUsersAPI = (_query?: string) => {
    const urlBackend = "/api/users";
    return userAxios.get<IUser[]>(urlBackend);
}

// Get user by ID - User Service
export const getUserByIdAPI = (id: number) => {
    const urlBackend = `/api/users/${id}`;
    return userAxios.get<IUser>(urlBackend);
}

// Get user by username - User Service
export const getUserByUsernameAPI = (username: string) => {
    const urlBackend = `/api/users/username/${username}`;
    return userAxios.get<IUser>(urlBackend);
}

// ==================== FOOD SERVICE APIs ====================

// Get all foods
export const getFoodsAPI = () => {
    const urlBackend = "/foods";
    return foodAxios.get<IFood[]>(urlBackend);
}

// Get food by ID
export const getFoodByIdAPI = (id: number) => {
    const urlBackend = `/foods/${id}`;
    return foodAxios.get<IFood>(urlBackend);
}

// Create food
export const createFoodAPI = (food: Partial<IFood>) => {
    const urlBackend = "/foods";
    return foodAxios.post<IFood>(urlBackend, food);
}

// Update food
export const updateFoodAPI = (id: number, food: Partial<IFood>) => {
    const urlBackend = `/foods/${id}`;
    return foodAxios.put<IFood>(urlBackend, food);
}

// Delete food
export const deleteFoodAPI = (id: number) => {
    const urlBackend = `/foods/${id}`;
    return foodAxios.delete(urlBackend);
}

// Upload food image
export const uploadFoodImageAPI = (foodId: number, file: File) => {
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    return foodAxios.post<IFood>(`/foods/${foodId}/image`, bodyFormData);
}

// Delete food image
export const deleteFoodImageAPI = (foodId: number) => {
    return foodAxios.delete(`/foods/${foodId}/image`);
}

// Get categories (hardcoded for now, can be extended)
export const getCategoryAPI = () => {
    // Return default food categories
    const categories = ['Đồ ăn', 'Đồ uống', 'Tráng miệng', 'Đồ ăn vặt', 'Combo'];
    return Promise.resolve({
        data: categories,
        statusCode: 200,
        message: 'success'
    } as IBackendRes<string[]>);
}

// ==================== ORDER SERVICE APIs ====================

// Create order
export const createOrderAPI = (
    userId: number,
    items: IOrderItem[],
    deliveryAddress: string,
    note?: string
) => {
    const urlBackend = "/orders";
    return orderAxios.post<IOrderResponse>(urlBackend, {
        userId,
        items,
        deliveryAddress,
        note
    });
}

// Get all orders
export const getOrdersAPI = (_query?: string) => {
    const urlBackend = "/orders";
    return orderAxios.get<IOrderResponse[]>(urlBackend);
}

// Get order by ID
export const getOrderByIdAPI = (id: number) => {
    const urlBackend = `/orders/${id}`;
    return orderAxios.get<IOrderResponse>(urlBackend);
}

// Update order status
export const updateOrderStatusAPI = (id: number, status: OrderStatus) => {
    const urlBackend = `/orders/${id}/status`;
    return orderAxios.put<IOrderResponse>(urlBackend, { status });
}

// Get user order history
export const getHistoryAPI = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        return { data: [], statusCode: 401, message: 'Not authenticated' };
    }

    const user = JSON.parse(userStr);
    const orders = await orderAxios.get<IOrderResponse[]>('/orders');

    // Filter orders by userId
    const userOrders = Array.isArray(orders)
        ? orders.filter((o: IOrderResponse) => o.userId === user.id)
        : [];

    return {
        data: userOrders,
        statusCode: 200,
        message: 'success'
    } as IBackendRes<IOrderResponse[]>;
}

// ==================== PAYMENT SERVICE APIs ====================

// Create payment
export const createPaymentAPI = (
    orderId: number,
    userId: number,
    paymentMethod: PaymentMethod
) => {
    const urlBackend = "/payments";
    return paymentAxios.post<IPaymentResponse>(urlBackend, {
        orderId,
        userId,
        paymentMethod
    });
}

// ==================== LEGACY/COMPATIBILITY APIs ====================

// These are kept for backward compatibility with existing components

// Legacy: Get books (maps to getFoodsAPI)
export const getBooksAPI = async (_query: string) => {
    const foods = await getFoodsAPI();
    const foodsArray = Array.isArray(foods) ? foods : [];

    // Convert to legacy paginated format
    return {
        data: {
            meta: {
                current: 1,
                pageSize: 100,
                pages: 1,
                total: foodsArray.length
            },
            result: foodsArray.map((food: IFood) => ({
                ...food,
                _id: String(food.id),
                mainText: food.name,
                thumbnail: food.imageUrl || '',
                author: '',
                quantity: food.stockQty,
                category: String(food.categoryId),
                sold: 0,
                slider: []
            }))
        },
        statusCode: 200,
        message: 'success'
    } as IBackendRes<IModelPaginate<IBookTable>>;
}

// Legacy: Get book by ID (maps to getFoodByIdAPI)
export const getBookByIdAPI = async (id: string) => {
    const food = await getFoodByIdAPI(Number(id));
    const foodData = food as IFood;

    return {
        data: {
            ...foodData,
            _id: String(foodData.id),
            mainText: foodData.name,
            thumbnail: foodData.imageUrl || '',
            author: '',
            quantity: foodData.stockQty,
            category: String(foodData.categoryId),
            sold: 0,
            slider: []
        },
        statusCode: 200,
        message: 'success'
    } as IBackendRes<IBookTable>;
}

// Legacy: Create book (maps to createFoodAPI)
export const createBookAPI = async (
    mainText: string, author: string,
    price: number, quantity: number, category: string,
    _thumbnail: string, _slider: string[]
) => {
    return createFoodAPI({
        name: mainText,
        description: author,
        price,
        stockQty: quantity,
        categoryId: parseInt(category) || 1,
        isAvailable: true
    });
}

// Legacy: Update book (maps to updateFoodAPI)
export const updateBookAPI = async (
    _id: string,
    mainText: string, author: string,
    price: number, quantity: number, category: string,
    _thumbnail: string, _slider: string[]
) => {
    return updateFoodAPI(Number(_id), {
        name: mainText,
        description: author,
        price,
        stockQty: quantity,
        categoryId: parseInt(category) || 1
    });
}

// Legacy: Delete book (maps to deleteFoodAPI)
export const deleteBookAPI = (_id: string) => {
    return deleteFoodAPI(Number(_id));
}

// Legacy: Upload file
export const uploadFileAPI = async (_fileImg: any, _folder: string) => {
    // This would need a separate file upload service
    // For now, return mock response
    return {
        data: { fileUploaded: '' },
        statusCode: 200,
        message: 'success'
    } as IBackendRes<{ fileUploaded: string }>;
}

// Legacy: Create user
export const createUserAPI = (fullName: string, email: string,
    password: string, _phone: string) => {
    return registerAPI(email, email, password, fullName);
}

// Legacy: Update user
export const updateUserAPI = (_id: string, _fullName: string, _phone: string) => {
    // User service doesn't have update endpoint yet
    return Promise.resolve({
        data: null,
        statusCode: 200,
        message: 'Update not supported'
    });
}

// Legacy: Delete user
export const deleteUserAPI = (_id: string) => {
    return Promise.resolve({
        data: null,
        statusCode: 200,
        message: 'Delete not supported'
    });
}

// Legacy: Update user info
export const updateUserInfoAPI = (
    _id: string, _avatar: string,
    fullName: string, phone: string) => {
    return updateUserAPI(_id, fullName, phone);
}

// Legacy: Update user password
export const updateUserPasswordAPI = (
    _email: string, _oldpass: string, _newpass: string) => {
    return Promise.resolve({
        data: null,
        statusCode: 200,
        message: 'Password change not supported'
    });
}

// Legacy: Bulk create users
export const bulkCreateUserAPI = (users: {
    fullName: string;
    password: string;
    email: string;
    phone: string;
}[]) => {
    return Promise.resolve({
        data: { countSuccess: 0, countError: users.length, detail: null },
        statusCode: 200,
        message: 'Bulk create not supported'
    } as IBackendRes<IResponseImport>);
}

// Legacy: Dashboard stats
export const getDashboardAPI = async () => {
    const foods = await getFoodsAPI();
    const orders = await getOrdersAPI();
    const users = await getUsersAPI();

    return {
        data: {
            countOrder: Array.isArray(orders) ? orders.length : 0,
            countUser: Array.isArray(users) ? users.length : 0,
            countBook: Array.isArray(foods) ? foods.length : 0,
            countFood: Array.isArray(foods) ? foods.length : 0
        },
        statusCode: 200,
        message: 'success'
    } as IBackendRes<{
        countOrder: number;
        countUser: number;
        countBook: number;
        countFood?: number;
    }>;
}

// Legacy: Google login (not supported with current backend)
export const loginWithGoogleAPI = (_type: string, _email: string) => {
    return Promise.resolve({
        data: undefined,
        statusCode: 400,
        message: 'Google login not supported'
    } as IBackendRes<ILogin>);
}



// Legacy: Update payment status
export const updatePaymentOrderAPI = (paymentStatus: string, paymentRef: string) => {
    const urlBackend = "/payments/notification-events";
    return paymentAxios.post<IBackendRes<IPaymentNotificationEvent>>(urlBackend, {
        paymentStatus,
        paymentRef
    });
}
