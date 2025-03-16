import React from 'react';
import { useSelector } from 'react-redux';
import { useGetFavoritesQuery } from '../store/slices/apiSlice';
import "./style.css";

function FavoritesPage() {
    const user = useSelector(state => state.auth.user);
    const favorites = useSelector(state => state.favorites.items);
    const { data: favoritesData = [], isLoading, isError } = useGetFavoritesQuery(user?.user_id);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (isError) {
        return <div>Ошибка при загрузке избранного</div>;
    }

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>

            <section className="favorites">
                <h2>Избранное</h2>
                <div className="favorites-list">
                    {favoritesData.length > 0 ? (
                        favoritesData.map((item) => (
                            <div key={item.product_id} className="favorite-item">
                                <img src={item.product_image} alt={item.product_name} />
                                <h3>{item.product_name}</h3>
                                <p className="price">₽ {item.price}</p>
                                <p>{favorites.includes(item.product_id) ? 'В избранном' : 'Не в избранном'}</p>
                            </div>
                        ))
                    ) : (
                        <p>В избранном пока ничего нет.</p>
                    )}
                </div>
            </section>

            <footer>
                <p>2025 Магазин Электроники</p>
                <p>Все права защищены</p>
            </footer>
        </div>
    );
}

export default FavoritesPage;