import React from 'react';
import { useSelector } from 'react-redux';
import { useGetPurchaseHistoryQuery } from '../store/slices/apiSlice';
import "./style.css";
import { Link } from 'react-router-dom';

function PurchaseHistoryPage() {
    const user = useSelector(state => state.auth.user);
    const { data: history = [], isLoading, isError } = useGetPurchaseHistoryQuery(user?.user_id);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Загружаем историю покупок...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="error-container">
                <h2>Произошла ошибка</h2>
                <p>Не удалось загрузить историю покупок</p>
            </div>
        );
    }

    return (
        <div className="purchase-history-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>История покупок</h1>
                    <p>Все ваши предыдущие заказы</p>
                </div>
            </header>

            <main className="main-content">
                {history.length > 0 ? (
                    <div className="history-container">
                        <div className="history-grid">
                            {history.map((item) => (
                                <div key={item.store_history_id} className="history-card">
                                    <div className="product-image-container">
                                        <img
                                            src={item.product_image || '/placeholder-image.jpg'}
                                            alt={item.product_name}
                                            className="product-image"
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3>{item.product_name}</h3>
                                        <p className="price">₽ {item.price.toLocaleString()}</p>
                                        <p className="purchase-date">
                                            {new Date(item.data_of_purchase).toLocaleDateString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="empty-history">
                        <div className="empty-icon">🛒</div>
                        <h2>История покупок пуста</h2>
                        <p>Здесь будут отображаться ваши покупки</p>
                        <Link to="/" className="browse-button">
                            Перейти к покупкам
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PurchaseHistoryPage;