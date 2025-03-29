import React from 'react';
import { useSelector } from 'react-redux';
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from '../store/slices/apiSlice';
import { Link } from 'react-router-dom';
import "./style.css";

function FavoritesPage() {
    const user = useSelector(state => state.auth.user);
    const { data: favorites = [], isLoading, isError } = useGetFavoritesQuery(user?.user_id);
    const [removeFavorite] = useRemoveFavoriteMutation();

    const handleRemoveFavorite = async (productId) => {
        if (!window.confirm('Удалить товар из избранного?')) return;

        try {
            await removeFavorite({
                user_id: user.user_id,
                product_id: productId
            }).unwrap();
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
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>Избранное</h1>
                    <p>Ваши любимые товары в одном месте</p>
                </div>
            </header>

            <main className="main-content">
                {favorites.length > 0 ? (
                    <div className="favorites-grid">
                        {favorites.map((product) => (
                            <div key={product.product_id} className="favorite-card">
                                <Link to={`/product/${product.product_id}`} className="product-link">
                                    <div className="product-image-container">
                                        <img
                                            src={product.product_image}
                                            alt={product.product_name}
                                            className="product-image"
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-title">{product.product_name}</h3>
                                        <p className="product-price">₽ {product.price.toLocaleString()}</p>
                                    </div>
                                </Link>
                                <div className="product-actions">
                                    <button
                                        onClick={() => handleRemoveFavorite(product.product_id)}
                                        className="remove-button"
                                    >
                                        Удалить из избранного
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-favorites">
                        <div className="empty-icon">❤️</div>
                        <h2>Ваше избранное пусто</h2>
                        <p>Добавляйте товары в избранное, нажимая на сердечко</p>
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

export default FavoritesPage;