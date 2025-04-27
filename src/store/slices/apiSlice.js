import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000' }),
    tagTypes: ['Favorites', 'Product', 'Orders'],
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
            invalidatesTags: ['Product'],
        }),
        getProducts: builder.query({
            query: () => '/products',
            providesTags: ['Product'],
        }),
        getProduct: builder.query({
            query: (productId) => `/products/${productId}`,
            providesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
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
            providesTags: ['Orders'],
        }),
        deleteProduct: builder.mutation({
            query: (productId) => ({
                url: `/products/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
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
            invalidatesTags: ['Product'],
        }),
        getPurchaseHistory: builder.query({
            query: (userId) => `/store_history/${userId}`,
        }),
        addToPurchaseHistory: builder.mutation({
            query: (purchaseData) => ({
                url: '/store_history',
                method: 'POST',
                body: purchaseData,
            }),
        }),
        deleteOrder: builder.mutation({
            query: (orderId) => ({
                url: `/admin/orders/${orderId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Orders'],
        }),
        createSupportTicket: builder.mutation({
            query: (ticketData) => ({
                url: '/support/tickets',
                method: 'POST',
                body: ticketData,
            }),
        }),
        getUserTickets: builder.query({
            query: (user_id) => `/support/tickets/user/${user_id}`,
            providesTags: ['SupportTickets'],
        }),
        getAllTickets: builder.query({
            query: () => '/support/tickets',
            providesTags: ['SupportTickets'],
        }),
        getTicketDetails: builder.query({
            query: (ticket_id) => `/support/tickets/${ticket_id}`,
            providesTags: ['TicketDetails'],
        }),
        addTicketReply: builder.mutation({
            query: ({ ticket_id, ...replyData }) => ({
                url: `/support/tickets/${ticket_id}/replies`,
                method: 'POST',
                body: replyData,
            }),
            invalidatesTags: ['TicketDetails'],
        }),
        updateTicketStatus: builder.mutation({
            query: ({ ticket_id, status }) => ({
                url: `/support/tickets/${ticket_id}/status`,
                method: 'PUT',
                body: { status },
            }),
            invalidatesTags: ['SupportTickets', 'TicketDetails'],
        }),
        deleteTicket: builder.mutation({
            query: (ticketId) => ({
                url: `/support/tickets/${ticketId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['SupportTickets'],
        }),
        checkOrderExists: builder.query({
            query: ({ orderId, userId }) => `/orders/check/${orderId}/${userId}`,
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
    useGetPurchaseHistoryQuery,
    useAddToPurchaseHistoryMutation,
    useDeleteOrderMutation,
    useCreateSupportTicketMutation,
    useGetUserTicketsQuery,
    useGetAllTicketsQuery,
    useGetTicketDetailsQuery,
    useAddTicketReplyMutation,
    useUpdateTicketStatusMutation,
    useDeleteTicketMutation,
    useCheckOrderExistsQuery,
} = apiSlice;
