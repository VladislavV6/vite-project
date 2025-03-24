import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetAdminOrdersQuery, useUpdateOrderMutation } from '../store/slices/apiSlice';
import { setAdminOrders, updateOrderStatus, selectAllOrders, selectOrdersLoading } from '../store/slices/ordersSlice';
import "./style.css";

function OrdersManagement() {
    const dispatch = useDispatch();
    const orders = useSelector(selectAllOrders);
    const isLoading = useSelector(selectOrdersLoading);
    const user = useSelector(state => state.auth.user);

    const {
        data: ordersData,
        isError: isOrdersError,
        error: ordersError,
        refetch
    } = useGetAdminOrdersQuery();

    const [updateOrder] = useUpdateOrderMutation();

    useEffect(() => {
        if (ordersData) {
            dispatch(setAdminOrders(ordersData));
        }
    }, [ordersData, dispatch]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrder({
                orderId,
                status: newStatus
            }).unwrap();
            dispatch(updateOrderStatus({ orderId, status: newStatus }));
            refetch();
        } catch (err) {
            console.error('Ошибка обновления:', err);
        }
    };

    if (!user || user.role_id !== 1) {
        return (
            <div className="auth-warning">
                <h3>Доступ запрещен</h3>
                <p>Требуются права администратора</p>
            </div>
        );
    }

    if (isLoading) return <div className="loading">Загрузка заказов...</div>;

    if (isOrdersError) {
        return (
            <div className="error">
                <h3>Ошибка загрузки</h3>
                <p>{ordersError?.data?.message || 'Ошибка сервера'}</p>
                <button onClick={refetch}>Повторить попытку</button>
            </div>
        );
    }

    return (
        <div className="orders-management">
            <h2>Управление заказами</h2>

            {orders?.length > 0 ? (
                <div className="orders-grid">
                    {orders.map(order => (
                        <div key={order.order_id} className="order-card">
                            <div className="order-header">
                                <h3>Заказ #{order.order_id}</h3>
                                <span className={`status ${order.status}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="order-meta">
                                <p><strong>Клиент ID:</strong> {order.user_id}</p>
                                <p><strong>Дата:</strong> {new Date(order.date_of_order).toLocaleString()}</p>
                                <p><strong>Сумма:</strong> ₽{order.order_amount}</p>
                            </div>

                            <div className="status-control">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                                >
                                    <option value="pending">В обработке</option>
                                    <option value="confirmed">Подтвержден</option>
                                    <option value="shipped">Отправлен</option>
                                    <option value="delivered">Доставлен</option>
                                    <option value="cancelled">Отменен</option>
                                </select>
                            </div>

                            {order.items?.length > 0 && (
                                <div className="order-items">
                                    <h4>Состав заказа:</h4>
                                    <ul>
                                        {order.items.map((item, idx) => (
                                            <li key={idx}>
                                                Товар #{item.product_id}: {item.product_count} шт. × ₽{item.price}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-orders">
                    <p>Нет заказов для отображения</p>
                    <button onClick={refetch}>Обновить</button>
                </div>
            )}
        </div>
    );
}

export default OrdersManagement;