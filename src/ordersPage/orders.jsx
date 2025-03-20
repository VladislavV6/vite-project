import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOrdersQuery } from '../store/slices/apiSlice';
import { setOrders } from '../store/slices/ordersSlice';
import "./style.css";

function OrdersPage() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const orders = useSelector(state => state.orders.items)
    const { data: ordersData, isLoading, isError, error } = useGetOrdersQuery(user?.user_id);

    useEffect(() => {
        if (ordersData) {
            dispatch(setOrders(ordersData));
        }
    }, [ordersData, dispatch]);

    if (isLoading) {
        return <p>Загрузка заказов...</p>;
    }

    if (isError) {
        return <p>Ошибка при загрузке заказов: {error.message}</p>;
    }

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>
            <section className="orders">
                <h2>Мои заказы</h2>
                {orders && orders.length > 0 ? (
                    <ul>
                        {orders.map((order) => (
                            <li key={order.order_id} className="order-item">
                                <div>
                                    <h3>Заказ №{order.order_id}</h3>
                                    <p>Дата заказа: {new Date(order.date_of_order).toLocaleDateString()}</p>
                                    <p>Общая стоимость: ₽ {order.order_amount}</p>
                                    <ul>
                                        {order.items && order.items.map((item, index) => (
                                            <li key={index} className="order-product-item">
                                                <p>Товар ID: {item.product_id} - {item.product_count} шт.</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-orders-message">У вас пока нет заказов.</p>
                )}
            </section>
            <footer>
                <p>2025 Магазин Электроники</p>
                <p>Все права защищены</p>
            </footer>
        </div>
    );
}

export default OrdersPage;