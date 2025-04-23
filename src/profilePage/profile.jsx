import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetOrdersQuery, useGetAllOrdersQuery, useUpdateUserMutation, useGetProductsQuery, useDeleteOrderMutation } from '../store/slices/apiSlice';
import { setOrders } from '../store/slices/ordersSlice';
import { setUser } from '../store/slices/authSlice';
import "./style.css";

function OrdersPage() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const orders = useSelector(state => state.orders.items);
    const { data: ordersData, isLoading, isError, error, refetch: refetchUserOrders } = useGetOrdersQuery(user?.user_id);
    const { data: allOrdersData, refetch: refetchAllOrders } = useGetAllOrdersQuery(undefined, {
        skip: user?.role_id !== 1
    });
    const [deleteOrder] = useDeleteOrderMutation();
    const [updateUser] = useUpdateUserMutation();
    const { data: products } = useGetProductsQuery();
    const getProductName = (productId) => {
        const product = products?.find(p => p.product_id === productId);
        return product?.product_name || `Товар #${productId}`;
    };
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        if (user?.role_id === 1 && allOrdersData) {
            dispatch(setOrders(allOrdersData));
        } else if (ordersData) {
            dispatch(setOrders(ordersData));
        }
    }, [ordersData, allOrdersData, dispatch, user]);

    const handleUpdate = async () => {
        if (password && password !== confirmPassword) {
            setUpdateError('Пароли не совпадают');
            return;
        }

        try {
            const updateData = { user_id: user.user_id };
            if (name && name !== user.name) updateData.name = name;
            if (password) updateData.password = password;

            const result = await updateUser(updateData).unwrap();

            dispatch(setUser({
                ...user,
                name: result.user.name
            }));

            setEditMode(false);
            setPassword('');
            setConfirmPassword('');
            setUpdateError('');
            alert('Данные успешно обновлены');
        } catch (err) {
            console.error('Ошибка при обновлении данных:', err);
            setUpdateError(err.data?.message || 'Ошибка при обновлении данных');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) return;

        try {
            await deleteOrder(orderId).unwrap();
            if (user?.role_id === 1) {
                const { data } = await refetchAllOrders();
                dispatch(setOrders(data));
            } else {
                const { data } = await refetchUserOrders();
                dispatch(setOrders(data));
            }
            alert('Заказ успешно удален');
        } catch (err) {
            console.error('Ошибка при удалении заказа:', err);
            alert('Не удалось удалить заказ');
        }
    };

    if (isLoading) {
        return <p>Загрузка...</p>;
    }

    if (isError) {
        return <p>Ошибка при загрузке данных: {error.message}</p>;
    }

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>TechStore</h1>
                <p>Личный кабинет</p>
            </header>

            <div className="profile-grid">
                <section className="profile-card">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <div className="profile-info">
                        <h2>{user?.name}</h2>
                        <p className="profile-email">{user?.email}</p>
                        <p className="profile-role">
                            {user?.role_id === 1 ? 'Администратор' : 'Пользователь'}
                        </p>

                        {editMode ? (
                            <div className="edit-profile-form">
                                <div className="form-field">
                                    <label>Ваше имя</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="profile-input"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Новый пароль</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="profile-input"
                                    />
                                </div>

                                {password && (
                                    <div className="form-field">
                                        <label>Подтвердите пароль</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="profile-input"
                                        />
                                    </div>
                                )}

                                {updateError && <div className="error-message">{updateError}</div>}

                                <div className="form-actions">
                                    <button
                                        onClick={handleUpdate}
                                        className="save-btn"
                                    >
                                        Сохранить изменения
                                    </button>
                                    <button
                                        onClick={() => setEditMode(false)}
                                        className="cancel-btn"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="edit-btn"
                            >
                                Редактировать профиль
                            </button>
                        )}
                    </div>
                </section>

                <section className="orders-card">
                    <h2 className="orders-title">
                        <i className="orders-icon">📦</i>
                        {user?.role_id === 1 ? 'Все заказы' : 'История заказов'}
                    </h2>

                    {orders && orders.length > 0 ? (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div key={order.order_id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-id">Заказ #{order.order_id}</span>
                                        <span className="order-date">
                                            {new Date(order.date_of_order).toLocaleDateString('ru-RU')}
                                        </span>
                                    </div>

                                    {user?.role_id === 1 && (
                                        <div className="order-customer">
                                            <span>{order.user_name}</span>
                                            <span>{order.user_email}</span>
                                            <button
                                                onClick={() => handleDeleteOrder(order.order_id)}
                                                className="delete-order-btn"
                                            >
                                                Удалить заказ
                                            </button>
                                        </div>

                                    )}

                                    <div className="order-summary">
                                    <div className="order-items">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="order-item">
                                                    <span className="item-name">
                                                        {getProductName(item.product_id)}
                                                    </span>
                                                    <span className="item-quantity">{item.product_count} шт.</span>
                                                    <span
                                                        className="item-price">₽{item.price * item.product_count}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-total">
                                            <span>Итого:</span>
                                            <span
                                                className="total-amount">₽{order.order_amount || order.items.reduce((sum, item) => sum + (item.price || item.product?.price || 0) * item.product_count, 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-orders">
                            <img src="/empty-orders.svg" alt="Нет заказов" className="no-orders-img"/>
                            <p>{user?.role_id === 1 ? 'В системе пока нет заказов' : 'У вас еще нет заказов'}</p>
                        </div>
                    )}
                </section>
            </div>

            <footer className="profile-footer">
                <p>© 2025 TechStore. Все права защищены</p>
            </footer>
        </div>
    );
}

export default OrdersPage;