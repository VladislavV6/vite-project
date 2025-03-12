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
} = apiSlice;