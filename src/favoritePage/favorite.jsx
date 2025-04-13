import React from 'react';
import { useSelector } from 'react-redux';
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from '../store/slices/apiSlice';
import { Link } from 'react-router-dom';
import "./style.css";

function FavoritesPage() {
    const user = useSelector(state => state.auth.user);
    const { data: favorites = [], isLoading, isError, refetch } = useGetFavoritesQuery(user?.user_id);
    const [removeFavorite] = useRemoveFavoriteMutation();

    const handleRemoveFavorite = async (productId) => {
        if (!window.confirm('Удалить товар из избранного?')) return;

        try {
            await removeFavorite({
                user_id: user.user_id,
                product_id: productId
            }).unwrap();
            refetch();
        } catch (err) {
            console.error('Ошибка при удалении из избранного:', err);
            alert('Не удалось удалить товар из избранного');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Загружаем ваши избранные товары...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="error-container">
                <h2>Произошла ошибка</h2>
                <p>Не удалось загрузить список избранных товаров</p>
                <button onClick={refetch} className="retry-button">Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <header className="favorites-header">
                <div className="header-content">
                    <h1 className="favorites-title">Избранное</h1>
                    <p className="favorites-subtitle">Ваши любимые товары в одном месте</p>
                    {favorites.length > 0 && (
                        <div className="favorites-count">{favorites.length} товар{favorites.length > 1 ? 'а' : ''}</div>
                    )}
                </div>
            </header>

            <main className="favorites-main">
                {favorites.length > 0 ? (
                    <div className="favorites-grid">
                        {favorites.map((product) => (
                            <div key={product.product_id} className="favorite-item">
                                <div
                                    className="favorite-remove"
                                    onClick={() => handleRemoveFavorite(product.product_id)}
                                    title="Удалить из избранного"
                                >
                                    &times;
                                </div>

                                <Link to={`/product/${product.product_id}`} className="favorite-link">
                                    <div className="favorite-image-container">
                                        <img
                                            src={product.product_image || '/placeholder-image.jpg'}
                                            alt={product.product_name}
                                            className="favorite-image"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </div>
                                    <div className="favorite-details">
                                        <h3 className="favorite-name">{product.product_name}</h3>
                                        <p className="favorite-price">{product.price.toLocaleString()} ₽</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="favorites-empty">
                        <div className="empty-icon">❤️</div>
                        <h2 className="empty-title">Ваше избранное пусто</h2>
                        <p className="empty-text">Добавляйте товары в избранное, нажимая на сердечко</p>
                        <Link to="/" className="empty-button">Перейти к покупкам</Link>
                    </div>
                )}
            </main>

            <footer className="favorites-footer">
                <p>© {new Date().getFullYear()} TechStore. Все права защищены.</p>
            </footer>
        </div>
    );
}

export default FavoritesPage;