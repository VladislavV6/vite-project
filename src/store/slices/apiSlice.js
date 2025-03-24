import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000' }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (userData) => ({
                url: '/register',
                method: 'POST',
                body: userData,
            }),
        }),
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        addProduct: builder.mutation({
            query: (productData) => ({
                url: '/add-product',
                method: 'POST',
                body: productData,
            }),
        }),
        getProducts: builder.query({
            query: () => '/products',
        }),
        getProduct: builder.query({
            query: (productId) => `/products/${productId}`,
        }),
        addFavorite: builder.mutation({
            query: (favoriteData) => ({
                url: '/favorites',
                method: 'POST',
                body: favoriteData,
            }),
        }),
        removeFavorite: builder.mutation({
            query: (favoriteData) => ({
                url: '/favorites',
                method: 'DELETE',
                body: favoriteData,
            }),
        }),
        getFavorites: builder.query({
            query: (user_id) => `/favorites/${user_id}`,
        }),
        addToCart: builder.mutation({
            query: (cartData) => ({
                url: '/cart',
                method: 'POST',
                body: cartData,
            }),
        }),
        removeFromCart: builder.mutation({
            query: (cartData) => ({
                url: '/cart',
                method: 'DELETE',
                body: cartData,
            }),
        }),
        clearCart: builder.mutation({
            query: (user_id) => ({
                url: '/cart/clear',
                method: 'DELETE',
                body: { user_id },
            }),
        }),
        updateCart: builder.mutation({
            query: (cartData) => ({
                url: '/cart',
                method: 'PUT',
                body: cartData,
            }),
        }),
        getCart: builder.query({
            query: (user_id) => `/cart/${user_id}`,
        }),
        createOrder: builder.mutation({
            query: (orderData) => ({
                url: '/orders',
                method: 'POST',
                body: orderData,
            }),
        }),
        getOrders: builder.query({
            query: (user_id) => `/orders/${user_id}`,
        }),
        getAdminOrders: builder.query({
            query: () => ({
                url: '/orders/admin',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            providesTags: ['AdminOrders']
        }),
        updateOrder: builder.mutation({
            query: ({ orderId, status }) => ({
                url: `/orders/${orderId}/status`,
                method: 'PATCH',
                body: { status },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            invalidatesTags: ['AdminOrders']
        })
    }),
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useAddProductMutation,
    useGetProductsQuery,
    useGetProductQuery,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
    useGetFavoritesQuery,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
    useGetCartQuery,
    useUpdateCartMutation,
    useCreateOrderMutation,
    useGetOrdersQuery,
    useGetAdminOrdersQuery,
    useUpdateOrderMutation
} = apiSlice;
