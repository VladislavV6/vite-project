import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity, setCart } from '../store/slices/cartSlice';
import { useRemoveFromCartMutation, useClearCartMutation, useUpdateCartMutation, useGetCartQuery, useCreateOrderMutation, useAddToPurchaseHistoryMutation} from '../store/slices/apiSlice';
import { Link } from 'react-router-dom';
import "./style.css";

function CartPage() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const cartItems = useSelector(state => state.cart.items);
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

    const handleQuantityChange = async (productId, quantity) => {
        if (!user) {
            alert('Войдите в систему, чтобы управлять корзиной');
            return;
        }

        if (quantity > 0) {
            try {
                await updateCartMutation({
                    user_id: user.user_id,
                    product_id: productId,
                    quantity_of_products: quantity
                }).unwrap();
                dispatch(updateQuantity({ productId, quantity }));
            } catch (err) {
                console.error('Ошибка при обновлении количества:', err);
                alert('Не удалось обновить количество товара');
            }
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
                        product_id: item.product.product_id
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
            </div>
        );
    }

    return (
        <div className="cart-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Корзина</h1>
                    <p>Ваши выбранные товары</p>
                </div>
            </header>

            <main className="main-content">
                {cartItems.length > 0 ? (
                    <div className="cart-container">
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div key={item.product.product_id} className="cart-item">
                                    <Link to={`/product/${item.product.product_id}`} className="product-link">
                                        <div className="product-image-container">
                                            <img
                                                src={item.product.product_image}
                                                alt={item.product.product_name}
                                                className="product-image"
                                            />
                                        </div>
                                    </Link>
                                    <div className="product-details">
                                        <h3 className="product-title">{item.product.product_name}</h3>
                                        <p className="product-price">₽ {item.product.price.toLocaleString()}</p>
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => handleQuantityChange(item.product.product_id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.product.product_id, parseInt(e.target.value) || 1)}
                                                min="1"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(item.product.product_id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromCart(item.product.product_id)}
                                        className="remove-button"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="summary-card">
                                <h3>Итого</h3>
                                <div className="summary-row">
                                    <span>Товары ({cartItems.reduce((total, item) => total + item.quantity, 0)})</span>
                                    <span>₽ {totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Общая сумма</span>
                                    <span>₽ {totalPrice.toLocaleString()}</span>
                                </div>
                                <button
                                    className="checkout-button"
                                    onClick={handleCreateOrder}
                                >
                                    Оформить заказ
                                </button>
                                <button
                                    className="clear-cart-button"
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
                        <p>Добавляйте товары в корзину, чтобы продолжить покупки</p>
                        <Link to="/" className="browse-button">Перейти к покупкам</Link>
                    </div>
                )}
            </main>

            <footer className="page-footer">
                <p>© 2025 TechStore. Все права защищены.</p>
            </footer>
        </div>
    );
}

export default CartPage;