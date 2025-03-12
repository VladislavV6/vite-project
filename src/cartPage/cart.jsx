import "./style.css"

function CartPage() {

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>
            <section className="cart">
                <h2>Корзина</h2>
                    <div>
                        <ul>
                            <li>
                                <div>
                                    <h3>Товар</h3>
                                    <p>Цена:</p>
                                    <p>Количество:</p>
                                    <button>Удалить</button>
                                </div>
                            </li>
                        </ul>
                        <p>Общая стоимость: </p>
                        <button>Очистить корзину</button>
                    </div>
            </section>
            <footer>
                <p>2025 Магазин Электроники</p>
                <p>Все права защищены</p>
            </footer>
        </div>
    );
}

export default CartPage;
