// catalog.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { setSearchTerm, clearSearchTerm } from "../store/slices/searchSlice";
import AddProductForm from './addproduct.jsx';
import EditProductForm from './editproduct.jsx';
import {
    useGetProductsQuery,
    useAddFavoriteMutation,
    useRemoveFavoriteMutation,
    useGetFavoritesQuery,
    useAddToCartMutation,
    useDeleteProductMutation,
    useGetCategoriesQuery,
    useUpdateProductMutation
} from '../store/slices/apiSlice.js';
import { setFavorites, addFavorite, removeFavorite } from '../store/slices/favoritesSlice';
import { addToCart } from '../store/slices/cartSlice';
import "./style.css";

function CatalogPage() {
    const dispatch = useDispatch();
    const searchTerm = useSelector((state) => state.search.searchTerm);
    const user = useSelector(state => state.auth.user);
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [addFavoriteMutation] = useAddFavoriteMutation();
    const [removeFavoriteMutation] = useRemoveFavoriteMutation();
    const [addToCartMutation] = useAddToCartMutation();
    const [deleteProduct] = useDeleteProductMutation();
    const [updateProduct] = useUpdateProductMutation();
    const favorites = useSelector(state => state.favorites.items);
    const { data: favoritesData } = useGetFavoritesQuery(user?.user_id);
    const { data: categories = [] } = useGetCategoriesQuery();
    const { data: products = [], isLoading, isError } = useGetProductsQuery();

    useEffect(() => {
        if (favoritesData) {
            dispatch(setFavorites(favoritesData.map(item => item.product_id)));
        }
    }, [favoritesData, dispatch]);

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleFavorite = async (productId) => {
        if (!user) {
            alert('Войдите в систему, чтобы добавлять товары в избранное');
            return;
        }

        try {
            const favoriteData = { user_id: user.user_id, product_id: productId };
            const isFavorite = favorites.includes(productId);

            if (isFavorite) {
                await removeFavoriteMutation(favoriteData).unwrap();
                dispatch(removeFavorite(productId));
            } else {
                await addFavoriteMutation(favoriteData).unwrap();
                dispatch(addFavorite(productId));
            }
        } catch (err) {
            console.error('Ошибка при работе с избранным:', err);
            alert('Произошла ошибка при обновлении избранного');
        }
    };

    const handleAddToCart = async (product) => {
        if (!user) {
            alert('Войдите в систему, чтобы добавлять товары в корзину');
            return;
        }

        try {
            await addToCartMutation({
                user_id: user.user_id,
                product_id: product.product_id,
                quantity_of_products: 1
            }).unwrap();
            dispatch(addToCart({ product, quantity: 1 }));
            alert('Товар добавлен в корзину');
        } catch (err) {
            console.error('Ошибка при добавлении в корзину:', err);
            alert('Произошла ошибка при добавлении в корзину');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            return;
        }

        try {
            await deleteProduct(productId).unwrap();
            alert('Товар успешно удален');
        } catch (err) {
            console.error('Ошибка при удалении товара:', err);
            alert('Произошла ошибка при удалении товара');
        }
    };

    const handleUpdateProduct = async (productId, updatedData) => {
        try {
            await updateProduct({
                productId: productId,
                productData: updatedData
            }).unwrap();
            setEditingProduct(null);
            alert('Товар успешно обновлен!');
            return true;
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка при обновлении: ${err.data?.message || err.message}`);
            return false;
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container" data-testid="loading-indicator">
                <div className="loader"></div>
                <p>Загружаем товары...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="error-container" data-testid="error-message">
                <h2>Произошла ошибка</h2>
                <p>Не удалось загрузить список товаров</p>
                <button className="retry-button">
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className="catalog-page" data-testid="catalog-page">
            <header className="catalog-header">
                <div className="header-content">
                    <h1 className="catalog-title">TechStore</h1>
                    <p className="catalog-subtitle">Техника для дома и бизнеса</p>
                </div>
            </header>

            <section className="hero-banner" aria-label="Рекламный баннер">
                <div className="banner-content">
                    <h2>Лучшие предложения для вас!</h2>
                    <p>Все новинки и горячие скидки на электронику</p>
                </div>
            </section>

            <main className="catalog-main">
                {user && (
                    <div className="user-panel" data-testid="user-panel">
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role_id === 1 ? 'Администратор' : 'Пользователь'}</span>
                        </div>
                        {Number(user.role_id) === 1 && (
                            <div className="admin-panel">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="admin-btn add-btn"
                                    aria-label="Добавить товар"
                                >
                                    <span>+</span> Добавить товар
                                </button>
                                <button
                                    onClick={() => {
                                        const productId = prompt('Введите ID товара для редактирования:');
                                        if (productId) {
                                            const productToEdit = products.find(p => p.product_id == productId);
                                            if (productToEdit) {
                                                setEditingProduct(productToEdit);
                                            } else {
                                                alert('Товар с таким ID не найден');
                                            }
                                        }
                                    }}
                                    className="admin-btn edit-btn"
                                    aria-label="Редактировать товар"
                                >
                                    ✏️ Редактировать
                                </button>
                                <button
                                    onClick={() => {
                                        const productId = prompt('Введите ID товара для удаления:');
                                        if (productId) handleDeleteProduct(productId);
                                    }}
                                    className="admin-btn delete-btn"
                                    aria-label="Удалить товар"
                                >
                                    🗑️ Удалить
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {showForm && user?.user_id && (
                    <AddProductForm
                        onCancel={() => setShowForm(false)}
                        userId={user.user_id}
                    />
                )}

                {editingProduct && (
                    <EditProductForm
                        product={editingProduct}
                        onCancel={() => setEditingProduct(null)}
                        onSave={handleUpdateProduct}
                        categories={categories}
                    />
                )}

                <div className="filter-panel">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Поиск товаров..."
                            value={searchTerm}
                            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                            className="search-input"
                            aria-label="Поиск товаров"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => dispatch(clearSearchTerm())}
                                className="clear-search"
                                aria-label="Очистить поиск"
                            >
                                &times;
                            </button>
                        )}
                    </div>

                    <div className="category-selector">
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                            className="category-select"
                            aria-label="Фильтр по категориям"
                        >
                            <option value="">Все категории</option>
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="products-container">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div key={product.product_id} className="product-item" data-testid={`product-${product.product_id}`}>
                                <button
                                    className={`favorite-btn ${favorites.includes(product.product_id) ? 'active' : ''}`}
                                    onClick={() => handleFavorite(product.product_id)}
                                    title={favorites.includes(product.product_id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                    aria-label={favorites.includes(product.product_id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                >
                                    {favorites.includes(product.product_id) ? '❤️' : '♡'}
                                </button>

                                <Link to={`/product/${product.product_id}`} className="product-link" aria-label={`Подробнее о ${product.product_name}`}>
                                    <div className="product-image-wrapper">
                                        <img
                                            src={product.product_image || '/placeholder-image.jpg'}
                                            alt={product.product_name}
                                            className="product-img"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="product-details">
                                        <h3 className="product-name">{product.product_name}</h3>
                                        <p className="product-price">{product.price.toLocaleString()} ₽</p>
                                        {user?.role_id === 1 && (
                                            <p className="product-id">ID: {product.product_id}</p>
                                        )}
                                    </div>
                                </Link>

                                <button
                                    className="cart-btn"
                                    onClick={() => handleAddToCart(product)}
                                    aria-label={`Добавить ${product.product_name} в корзину`}
                                >
                                    В корзину
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" data-testid="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>Товары не найдены</h3>
                            <p>Попробуйте изменить параметры поиска</p>
                            <button
                                onClick={() => {
                                    dispatch(clearSearchTerm());
                                    setSelectedCategory(null);
                                }}
                                className="reset-btn"
                            >
                                Сбросить фильтры
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="catalog-footer">
                <p>© {new Date().getFullYear()} TechStore. Все права защищены.</p>
            </footer>
        </div>
    );
}

export default CatalogPage;