import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity, setCart } from '../store/slices/cartSlice';
import { useRemoveFromCartMutation, useClearCartMutation, useUpdateCartMutation, useGetCartQuery, useCreateOrderMutation } from '../store/slices/apiSlice';
import "./style.css";

function CartPage() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const cartItems = useSelector(state => state.cart.items);
    const [removeFromCartMutation] = useRemoveFromCartMutation();
    const [clearCartMutation] = useClearCartMutation();
    const [updateCartMutation] = useUpdateCartMutation();
    const [createOrderMutation] = useCreateOrderMutation();
    const { data: cartData, refetch } = useGetCartQuery(user?.user_id);

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

        try {
            await removeFromCartMutation({ user_id: user.user_id, product_id: productId }).unwrap();
            dispatch(removeFromCart(productId));
        } catch (err) {
            console.error('Ошибка при удалении из корзины:', err);
        }
    };

    const handleClearCart = async () => {
        if (!user) {
            alert('Войдите в систему, чтобы управлять корзиной');
            return;
        }

        try {
            await clearCartMutation(user.user_id).unwrap();
            dispatch(clearCart());
        } catch (err) {
            console.error('Ошибка при очистке корзины:', err);
        }
    };

    const handleQuantityChange = async (productId, quantity) => {
        if (!user) {
            alert('Войдите в систему, чтобы управлять корзиной');
            return;
        }

        if (quantity > 0) {
            try {
                await updateCartMutation({ user_id: user.user_id, product_id: productId, quantity_of_products: quantity }).unwrap();
                dispatch(updateQuantity({ productId, quantity }));
            } catch (err) {
                console.error('Ошибка при обновлении количества:', err);
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

            await clearCartMutation(user.user_id).unwrap();
            dispatch(clearCart());

            alert('Заказ успешно оформлен!');
        } catch (err) {
            console.error('Ошибка при оформлении заказа:', err);
            alert('Ошибка при оформлении заказа');
        }
    };

    const totalPrice = cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>
            <section className="cart">
                <h2>Корзина</h2>
                {cartItems.length > 0 ? (
                    <div>
                        <ul>
                            {cartItems.map((item) => (
                                <li key={item.product.product_id}>
                                    <div>
                                        <h3>{item.product.product_name}</h3>
                                        <p>Цена: ₽ {item.product.price}</p>
                                        <p>
                                            Количество:
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.product.product_id, parseInt(e.target.value))}
                                                min="1"
                                            />
                                        </p>
                                        <button onClick={() => handleRemoveFromCart(item.product.product_id)}>
                                            Удалить
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className="total-price">Общая стоимость: ₽ {totalPrice}</p>
                        <button className="clear-cart-button" onClick={handleClearCart}>
                            Очистить корзину
                        </button>
                        <button className="create-order-button" onClick={handleCreateOrder}>
                            Сделать заказ
                        </button>
                    </div>
                ) : (
                    <p className="empty-cart-message">Ваша корзина пуста.</p>
                )}
            </section>
            <footer>
                <p>2025 Магазин Электроники</p>
                <p>Все права защищены</p>
            </footer>
        </div>
    );
}

export default CartPage;