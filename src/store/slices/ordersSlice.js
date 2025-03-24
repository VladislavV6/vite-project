import { createSlice } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        items: [],
        adminItems: [],
        loading: false,
        error: null,
        lastFetch: null
    },
    reducers: {
        setOrders: (state, action) => {
            state.items = action.payload;
            state.loading = false;
            state.error = null;
            state.lastFetch = Date.now();
        },
        setAdminOrders: (state, action) => {
            state.adminItems = action.payload;
            state.loading = false;
            state.error = null;
            state.lastFetch = Date.now();
        },
        setLoading: (state) => {
            state.loading = true;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearOrders: (state) => {
            state.items = [];
            state.adminItems = [];
            state.loading = false;
            state.error = null;
            state.lastFetch = null;
        },
        updateOrderStatus: (state, action) => {
            const { orderId, status } = action.payload;
            state.items = state.items.map(order =>
                order.order_id === orderId ? { ...order, status } : order
            );
            state.adminItems = state.adminItems.map(order =>
                order.order_id === orderId ? { ...order, status } : order
            );
        }
    }
});

export const {
    setOrders,
    setAdminOrders,
    setLoading,
    setError,
    clearOrders,
    updateOrderStatus
} = ordersSlice.actions;

export const selectUserOrders = state => state.orders.items;
export const selectAllOrders = state => state.orders.adminItems;
export const selectOrdersLoading = state => state.orders.loading;
export const selectOrdersError = state => state.orders.error;

export default ordersSlice.reducer;