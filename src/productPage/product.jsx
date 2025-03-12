import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductQuery } from '../store/slices/apiSlice';
import "./style.css";

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const { data: product, isLoading, isError } = useGetProductQuery(productId);

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (isError || !product) {
        return <div>Товар не найден</div>;
    }

    const handleBack = () => {
        navigate(-1); //
    };

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>
            <section className="product-details">
                <div className="product-left">
                    <h2>{product.product_name}</h2>
                    <div className="product-image">
                        <img src={product.product_image} alt={product.product_name} />
                    </div>
                </div>

                <div className="product-right">
                    <p className="description">{product.product_description}</p>
                    <div className="product-rating">
                        <p>Оцените товар:</p>
                        <form>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <React.Fragment key={star}>
                                    <input
                                        type="radio"
                                        id={`star${star}`}
                                        name="rating"
                                        value={star}
                                    />
                                    <label htmlFor={`star${star}`}>{star}</label>
                                </React.Fragment>
                            ))}
                        </form>
                    </div>
                    <div className="product-comment">
                        <textarea placeholder="Оставьте ваш комментарий..." rows="4"></textarea>
                    </div>
                    <button type="submit">Отправить</button>
                </div>
            </section>

            <footer>
                <p>2025 Магазин Электроники</p>
                <p>Все права защищены</p>
            </footer>
        </div>
    );
}

export default ProductPage;