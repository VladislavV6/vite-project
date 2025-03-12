import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { setSearchTerm, clearSearchTerm } from "../store/slices/searchSlice";
import AddProductForm from './addproduct.jsx';
import { useGetProductsQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../store/slices/apiSlice.js';
import "./style.css";

function HomePage() {
    const dispatch = useDispatch();
    const searchTerm = useSelector((state) => state.search.searchTerm);
    const user = useSelector(state => state.auth.user);
    const [showForm, setShowForm] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [addFavorite] = useAddFavoriteMutation();
    const [removeFavorite] = useRemoveFavoriteMutation();


    const { data: products = [], refetch } = useGetProductsQuery();

    useEffect(() => {
        console.log('User data in HomePage:', user);
    }, [user]);

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFavorite = async (productId) => {
        if (!user) {
            alert('Войдите в систему, чтобы добавлять товары в избранное');
            return;
        }

        try {
            const favoriteData = { user_id: user.user_id, product_id: productId };

            const isFavorite = user.favorites?.includes(productId);

            if (isFavorite) {
                await removeFavorite(favoriteData).unwrap();
                alert('Товар удален из избранного');
            } else {
                await addFavorite(favoriteData).unwrap();
                alert('Товар добавлен в избранное');
            }

            refetch();
        } catch (err) {
            console.error('Ошибка при работе с избранным:', err);
            alert('Ошибка при работе с избранным');
        }
    };


    const handleAddToCart = (productId) => {
        console.log(`Товар с ID ${productId} добавлен в корзину`);
    };

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>

            <section className="hero">
                <h2>Лучшие предложения для вас!</h2>
                <p>Все новинки и горячие скидки на электронику.</p>
            </section>

            {user && (
                <div style={{border: '2px solid red', padding: '10px'}}>
                    <pre>Role ID: {JSON.stringify(user.role_id)}</pre>
                    {Number(user.role_id) === 1 && (
                        <button onClick={() => setShowForm(true)}>Добавить товар</button>
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

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchTerm}
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                />
                <button onClick={() => dispatch(clearSearchTerm())}>Очистить</button>
            </div>

            <section className="products">
                {filteredProducts.map((product) => (
                    <div key={product.product_id} className="product-card">
                        <div
                            className={`favorite-icon ${user?.favorites?.includes(product.product_id) ? 'active' : ''}`}
                            onClick={() => handleFavorite(product.product_id)}
                        >
                            {user?.favorites?.includes(product.product_id) ? '❤️' : '♡'}
                        </div>

                        <Link to={`/product/${product.product_id}`}>
                            <img src={product.product_image} alt={product.product_name}/>
                        </Link>
                        <Link to={`/product/${product.product_id}`}>
                            <h3>{product.product_name}</h3>
                        </Link>
                        <p className="price">₽ {product.price}</p>

                        <button className="add-to-cart" onClick={() => handleAddToCart(product.product_id)}>
                            Добавить в корзину
                        </button>
                    </div>
                ))}
            </section>

            <footer>
                <p>2025 Магазин Электроники</p>
                <p>Все права защищены</p>
            </footer>
        </div>
    );
}

export default HomePage;