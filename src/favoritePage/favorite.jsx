import React from 'react';
import "./style.css"

function FavoritesPage() {
    const favorites = [
        { id: 1, name: 'Смартфон XYZ', price: '₽ 40,000', image: 'https://via.placeholder.com/220x150' },
        { id: 2, name: 'Ноутбук ABC', price: '₽ 80,000', image: 'https://via.placeholder.com/220x150' },
    ];

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>

            <section className="favorites">
                <h2>Избранное</h2>
                <div className="favorites-list">
                    {favorites.length > 0 ? (
                        favorites.map((item) => (
                            <div key={item.id} className="favorite-item">
                                <img src={item.image} alt={item.name} />
                                <h3>{item.name}</h3>
                                <p className="price">{item.price}</p>
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
