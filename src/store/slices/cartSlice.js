import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
    },
    reducers: {
        addToCart: (state, action) => {
            const { product, quantity } = action.payload;
            const existingItem = state.items.find(item => item.product.product_id === product.product_id);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ product, quantity });
            }
        },
        removeFromCart: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(item => item.product.product_id !== productId);
        },
        clearCart: (state) => {
            state.items = [];
        },
        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            const itemIndex = state.items.findIndex(item => item.product.product_id === productId);
            if (itemIndex !== -1) {
                state.items[itemIndex].quantity = Number(quantity);
            }
        },
        setCart: (state, action) => {
            state.items = action.payload;
        },
    },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity, setCart } = cartSlice.actions;
export default cartSlice.reducer;
