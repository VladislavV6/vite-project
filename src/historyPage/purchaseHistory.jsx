import React, {useEffect} from 'react';
import { useSelector } from 'react-redux';
import { useGetPurchaseHistoryQuery } from '../store/slices/apiSlice';
import "./style.css";
import { Link } from 'react-router-dom';

function PurchaseHistoryPage() {
    const user = useSelector(state => state.auth.user);
    const { data: history = [], isLoading, isError, refetch } = useGetPurchaseHistoryQuery(user?.user_id);

    useEffect(() => {
        refetch();
    }, [refetch]);

    if (isLoading) {
        return (
            <div className="ph-loading-container">
                <div className="ph-loader"></div>
                <p>Загружаем историю покупок...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="ph-error-container">
                <h2>Произошла ошибка</h2>
                <p>Не удалось загрузить историю покупок</p>
            </div>
        );
    }

    return (
        <div className="ph-page">
            <header className="ph-header">
                <div className="ph-header-content">
                    <h1 className="ph-title">История покупок</h1>
                    <p className="ph-subtitle">Все ваши предыдущие заказы</p>
                </div>
            </header>

            <main className="ph-main">
                {history.length > 0 ? (
                    <div className="ph-container">
                        <div className="ph-grid">
                            {history.map((item) => (
                                <div key={item.store_history_id} className="ph-card">
                                    <div className="ph-image-container">
                                        <img
                                            src={item.product_image || '/ph-placeholder.jpg'}
                                            alt={item.product_name}
                                            className="ph-image"
                                            onError={(e) => {
                                                e.target.src = '/ph-placeholder.jpg';
                                                e.target.className = 'ph-image ph-image-error';
                                            }}
                                        />
                                    </div>
                                    <div className="ph-info">
                                        <h3 className="ph-product-name">{item.product_name}</h3>
                                        <div className="ph-meta">
                                            <p className="ph-price">₽{item.price.toLocaleString('ru-RU')}</p>
                                            <p className="ph-quantity">{item.history_product_count} шт.</p>
                                        </div>
                                        <div className="ph-meta">
                                            <p className="ph-total-price">Сумма: ₽{(item.price * item.history_product_count).toLocaleString('ru-RU')}</p>
                                        </div>
                                        <p className="ph-date">
                                            {new Date(item.data_of_purchase).toLocaleDateString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                        <Link
                                            to={`/product/${item.product_id}`}
                                            className="ph-details-link"
                                        >
                                            Подробнее о товаре
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="ph-empty">
                        <div className="ph-empty-icon">🛒</div>
                        <h2 className="ph-empty-title">История покупок пуста</h2>
                        <p className="ph-empty-text">Здесь будут отображаться ваши покупки</p>
                        <Link to="/" className="ph-browse-button">
                            Перейти к покупкам
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default PurchaseHistoryPage;