import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity, setCart } from '../store/slices/cartSlice';
import { useRemoveFromCartMutation, useClearCartMutation, useUpdateCartMutation, useGetCartQuery, useCreateOrderMutation, useAddToPurchaseHistoryMutation} from '../store/slices/apiSlice';
import { Link } from 'react-router-dom';
import "./style.css";

function CartPage() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const [isUpdating, setIsUpdating] = useState({});
    const cartItems = useSelector(state => state.cart.items.map(item => ({
        ...item,
        image: item.image || item.product.product_image
    })));
    const [removeFromCartMutation] = useRemoveFromCartMutation();
    const [clearCartMutation] = useClearCartMutation();
    const [updateCartMutation] = useUpdateCartMutation();
    const [createOrderMutation] = useCreateOrderMutation();
    const [addToPurchaseHistory] = useAddToPurchaseHistoryMutation();
    const { data: cartData, isLoading, isError, refetch } = useGetCartQuery(user?.user_id);

    useEffect(() => {
        if (cartData) {
            dispatch(setCart(cartData));
        }
    }, [cartData, dispatch]);

    useEffect(() => {
        if (user) {
            refetch();
        }
    }, [user, refetch]);

    const handleRemoveFromCart = async (productId) => {
        if (!user) {
            alert('Войдите в систему, чтобы управлять корзиной');
            return;
        }

        if (!window.confirm('Удалить товар из корзины?')) return;

        try {
            await removeFromCartMutation({ user_id: user.user_id, product_id: productId }).unwrap();
            dispatch(removeFromCart(productId));
        } catch (err) {
            console.error('Ошибка при удалении из корзины:', err);
            alert('Не удалось удалить товар из корзины');
        }
    };

    const handleClearCart = async () => {
        if (!user) {
            alert('Войдите в систему, чтобы управлять корзиной');
            return;
        }

        if (!window.confirm('Очистить всю корзину?')) return;

        try {
            await clearCartMutation(user.user_id).unwrap();
            dispatch(clearCart());
        } catch (err) {
            console.error('Ошибка при очистке корзины:', err);
            alert('Не удалось очистить корзину');
        }
    };

    const handleQuantityChange = async (productId, change) => {
        if (!user || isUpdating[productId]) return;

        const currentItem = cartItems.find(item => item.product.product_id === productId);
        if (!currentItem) return;

        const currentQuantity = Number(currentItem.quantity);
        const newQuantity = currentQuantity + change;

        if (newQuantity < 1) return;

        setIsUpdating(prev => ({ ...prev, [productId]: true }));

        try {
            await updateCartMutation({
                user_id: user.user_id,
                product_id: productId,
                quantity_of_products: newQuantity
            }).unwrap();

            dispatch(updateQuantity({ productId, quantity: newQuantity }));
        } catch (err) {
            console.error('Ошибка при обновлении количества:', err);
            alert('Не удалось обновить количество товара');
        } finally {
            setIsUpdating(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleCreateOrder = async () => {
        if (!user) {
            alert('Войдите в систему, чтобы оформить заказ');
            return;
        }

        if (cartItems.length === 0) {
            alert('Ваша корзина пуста');
            return;
        }

        if (!window.confirm('Оформить заказ?')) return;

        try {
            const orderData = {
                user_id: user.user_id,
                order_amount: cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0),
                items: cartItems.map(item => ({
                    product_id: item.product.product_id,
                    product_count: item.quantity,
                })),
            };

            await createOrderMutation(orderData).unwrap();

            await Promise.all(
                cartItems.map(item =>
                    addToPurchaseHistory({
                        user_id: user.user_id,
                        product_id: item.product.product_id,
                        history_product_count: item.quantity // Добавляем количество товаров
                    }).unwrap()
                )
            );

            await clearCartMutation(user.user_id).unwrap();
            dispatch(clearCart());

            alert('Заказ успешно оформлен!');
        } catch (err) {
            console.error('Ошибка при оформлении заказа:', err);
            alert('Ошибка при оформлении заказа');
        }
    };

    const totalPrice = cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
    const totalItems = cartItems.reduce((total, item) => total + Number(item.quantity), 0);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Загружаем вашу корзину...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="error-container">
                <h2>Произошла ошибка</h2>
                <p>Не удалось загрузить содержимое корзины</p>
                <button onClick={refetch} className="retry-button">Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <header className="cart-header">
                <div className="header-content">
                    <h1 className="cart-title">Ваша корзина</h1>
                    <p className="cart-subtitle">
                        {totalItems} {totalItems === 1 ? 'товар' : totalItems >= 2 && totalItems <= 4 ? 'товара' : 'товаров'} на
                        сумму ₽{totalPrice.toLocaleString()}
                    </p>
                </div>
            </header>

            <main className="cart-main">
                {cartItems.length > 0 ? (
                    <div className="cart-layout">
                    <div className="cart-products">
                            {cartItems.map((item) => (
                                <div key={item.product.product_id} className="cart-product-item">
                                    <div className="product-image-wrapper">
                                        <Link to={`/product/${item.product.product_id}`}>
                                            <img
                                                src={item.savedImage || item.product.product_image}
                                                alt={item.product.product_name}
                                                className="product-image"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.jpg';
                                                    e.target.style.objectFit = 'cover';
                                                }}
                                            />
                                        </Link>
                                    </div>
                                    <div className="product-info">
                                        <div className="product-info-header">
                                            <Link to={`/product/${item.product.product_id}`} className="product-name">
                                                {item.product.product_name}
                                            </Link>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.product.product_id)}
                                                className="remove-btn"
                                                aria-label="Удалить товар"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="product-price">₽ {item.product.price.toLocaleString()}</div>
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => handleQuantityChange(item.product.product_id, -1)}
                                                disabled={item.quantity <= 1 || isUpdating[item.product.product_id]}
                                            >
                                                −
                                            </button>
                                            <span className="quantity-value">
                                            {isUpdating[item.product.product_id] ? '...' : item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.product.product_id, 1)}
                                                disabled={isUpdating[item.product.product_id]}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>

                        <div className="cart-summary">
                            <div className="summary-card">
                                <h3>Итог заказа</h3>
                                <div className="summary-row">
                                    <span>Товары ({totalItems})</span>
                                    <span>₽ {totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                <span>Доставка</span>
                                    <span>Бесплатно</span>
                                </div>
                                <div className="summary-total">
                                    <span>Общая сумма</span>
                                    <span>₽ {totalPrice.toLocaleString()}</span>
                                </div>
                                <button
                                    className="checkout-btn"
                                    onClick={handleCreateOrder}
                                >
                                    Оформить заказ
                                </button>
                                <button
                                    className="clear-cart-btn"
                                    onClick={handleClearCart}
                                >
                                    Очистить корзину
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart">
                        <div className="empty-icon">🛒</div>
                        <h2>Ваша корзина пуста</h2>
                        <p>Начните с главной страницы, чтобы добавить товары</p>
                        <Link to="/" className="browse-btn">Перейти к покупкам</Link>
                    </div>
                )}
            </main>

            <footer className="cart-footer">
                <p>© {new Date().getFullYear()} TechStore. Все права защищены.</p>
            </footer>
        </div>
    );
}

export default CartPage;