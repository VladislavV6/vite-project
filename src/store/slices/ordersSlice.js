import { createSlice } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {
        setOrders: (state, action) => {
            state.items = action.payload;
            state.loading = false;
            state.error = null;
        },
    }
});

export const { setOrders, setLoading, setError, clearOrders } = ordersSlice.actions;

export default ordersSlice.reducer;