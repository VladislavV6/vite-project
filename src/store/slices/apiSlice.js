import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000' }),
    tagTypes: ['Favorites'],
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
            invalidatesTags: ['Favorites'],
        }),
        removeFavorite: builder.mutation({
            query: (favoriteData) => ({
                url: '/favorites',
                method: 'DELETE',
                body: favoriteData,
            }),
            invalidatesTags: ['Favorites'],
        }),
        getFavorites: builder.query({
            query: (user_id) => `/favorites/${user_id}`,
            providesTags: ['Favorites'],
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
        getAllOrders: builder.query({
            query: () => '/admin/orders',
        }),
        deleteProduct: builder.mutation({
            query: (productId) => ({
                url: `/products/${productId}`,
                method: 'DELETE',
            }),
        }),
        getReviews: builder.query({
            query: (productId) => `/reviews/${productId}`,
        }),
        addReview: builder.mutation({
            query: (reviewData) => ({
                url: '/reviews',
                method: 'POST',
                body: reviewData,
            }),
        }),
        deleteReview: builder.mutation({
            query: (reviewId) => ({
                url: `/reviews/${reviewId}`,
                method: 'DELETE',
            }),
        }),
        getCategories: builder.query({
            query: () => '/categories',
        }),
        updateUser: builder.mutation({
            query: (userData) => ({
                url: '/update-user',
                method: 'PUT',
                body: userData,
            }),
        }),
        updateProduct: builder.mutation({
            query: ({ productId, productData }) => ({
                url: `/products/${productId}`,
                method: 'PUT',
                body: productData,
            }),
        }),
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
    useGetAllOrdersQuery,
    useDeleteProductMutation,
    useGetReviewsQuery,
    useAddReviewMutation,
    useDeleteReviewMutation,
    useGetCategoriesQuery,
    useUpdateUserMutation,
    useUpdateProductMutation,
} = apiSlice;
