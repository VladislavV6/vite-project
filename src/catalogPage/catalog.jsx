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
    const { data: products = [], isLoading, isError, refetch } = useGetProductsQuery();

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
            alert('Ошибка при добавлении в корзину');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            return;
        }

        try {
            await deleteProduct(productId).unwrap();
            refetch();
        } catch (err) {
            console.error('Ошибка при удалении товара:', err);
            alert('Ошибка при удалении товара');
        }
    };

    const handleUpdateProduct = async (productId, updatedData) => {
        try {
            await updateProduct({
                productId: productId,
                productData: updatedData
            }).unwrap();
            refetch();
            setEditingProduct(null);
            alert('Товар успешно обновлен!');
            return true;
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Ошибка при обновлении');
            return false;
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Загружаем товары...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="error-container">
                <h2>Произошла ошибка</h2>
                <p>Не удалось загрузить список товаров</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            <header className="page-header">
                <div className="header-content">
                    <h1>TechStore</h1>
                    <p>Техника для дома и бизнеса</p>
                </div>
            </header>

            <section className="hero-section">
                <div className="hero-content">
                    <h2>Лучшие предложения для вас!</h2>
                    <p>Все новинки и горячие скидки на электронику</p>
                </div>
            </section>

            <main className="main-content">
                {user && (
                    <div className="user-info-card">
                        <p>Вы вошли как: <strong>{user.name}</strong> (Роль: {user.role_id === 1 ? 'Администратор' : 'Пользователь'})</p>
                        {Number(user.role_id) === 1 && (
                            <div className="admin-actions">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="admin-button add-button"
                                >
                                    Добавить товар
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
                                    className="admin-button edit-button"
                                >
                                    Редактировать товар
                                </button>
                                <button
                                    onClick={() => {
                                        const productId = prompt('Введите ID товара для удаления:');
                                        if (productId) handleDeleteProduct(productId);
                                    }}
                                    className="admin-button delete-button"
                                >
                                    Удалить товар
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {showForm && user?.user_id && (
                    <AddProductForm
                        onCancel={() => setShowForm(false)}
                        userId={user.user_id}
                        onProductAdded={refetch}
                    />
                )}

                {editingProduct && (
                    <EditProductForm
                        product={editingProduct}
                        onCancel={() => setEditingProduct(null)}
                        onSave={handleUpdateProduct}
                        onProductUpdated={() => {
                            refetch();
                            setEditingProduct(null);
                        }}
                        categories={categories}
                    />
                )}

                <div className="search-filter-container">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Поиск товаров..."
                            value={searchTerm}
                            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => dispatch(clearSearchTerm())}
                                className="clear-search-button"
                            >
                                Очистить
                            </button>
                        )}
                    </div>

                    <div className="category-filter">
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
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

                <div className="products-grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <div key={product.product_id} className="product-card">
                                <div
                                    className={`favorite-icon ${favorites.includes(product.product_id) ? 'active' : ''}`}
                                    onClick={() => handleFavorite(product.product_id)}
                                    title={favorites.includes(product.product_id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                >
                                    {favorites.includes(product.product_id) ? '❤️' : '♡'}
                                </div>

                                <Link to={`/product/${product.product_id}`} className="product-link">
                                    <div className="product-image-container" data-has-image={!!product.product_image}>
                                        <img
                                            src={product.product_image || '/placeholder-image.jpg'}
                                            alt={product.product_name}
                                            className="product-image"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                                e.target.parentElement.setAttribute('data-has-image', 'false');
                                            }}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-title">{product.product_name}</h3>
                                        <p className="product-price">₽ {product.price.toLocaleString()}</p>
                                        {user?.role_id === 1 && (
                                            <p className="product-id">ID: {product.product_id}</p>
                                        )}
                                    </div>
                                </Link>

                                <button
                                    className="add-to-cart-button"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    Добавить в корзину
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-products">
                            <div className="empty-icon">🔍</div>
                            <h2>Товары не найдены</h2>
                            <p>Попробуйте изменить параметры поиска</p>
                            <button
                                onClick={() => {
                                    dispatch(clearSearchTerm());
                                    setSelectedCategory(null);
                                }}
                                className="reset-filters-button"
                            >
                                Сбросить фильтры
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="page-footer">
                <p>© 2025 TechStore. Все права защищены.</p>
            </footer>
        </div>
    );
}

export default CatalogPage;