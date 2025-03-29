import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetProductQuery,
    useGetReviewsQuery,
    useAddReviewMutation,
    useDeleteReviewMutation,
    useAddToCartMutation
} from '../store/slices/apiSlice';
import { useSelector } from 'react-redux';
import "./style.css";

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);

    const { data: product, isLoading, isError } = useGetProductQuery(productId);
    const { data: reviews = [], refetch: refetchReviews } = useGetReviewsQuery(productId);
    const [addReview] = useAddReviewMutation();
    const [deleteReview] = useDeleteReviewMutation();
    const [addToCart] = useAddToCartMutation();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);

    if (isLoading) {
        return <div className="loading-container">Загрузка...</div>;
    }

    if (isError || !product) {
        return <div className="error-container">Товар не найден</div>;
    }

    const handleBack = () => {
        navigate(-1);
    };

    const handleAddToCart = async () => {
        if (!user) {
            alert('Войдите в систему, чтобы добавить товар в корзину');
            return;
        }

        try {
            await addToCart({
                user_id: user.user_id,
                product_id: productId,
                quantity_of_products: 1
            }).unwrap();
            alert('Товар добавлен в корзину');
        } catch (err) {
            console.error('Ошибка при добавлении в корзину:', err);
            alert('Ошибка при добавлении в корзину');
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Войдите в систему, чтобы оставить отзыв');
            return;
        }

        if (rating === 0) {
            alert('Пожалуйста, поставьте оценку');
            return;
        }

        try {
            await addReview({
                user_id: user.user_id,
                product_id: productId,
                grade: rating,
                comment_content: comment
            }).unwrap();

            setRating(0);
            setComment('');
            refetchReviews();
            alert('Отзыв успешно добавлен');
        } catch (err) {
            console.error('Ошибка при добавлении отзыва:', err);
            alert(err.data?.message || 'Ошибка при добавлении отзыва');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            return;
        }

        try {
            await deleteReview(reviewId).unwrap();
            refetchReviews();
            alert('Отзыв успешно удален');
        } catch (err) {
            console.error('Ошибка при удалении отзыва:', err);
            alert('Ошибка при удалении отзыва');
        }
    };

    return (
        <div className="product-page">
            <header className="product-header">
                <div className="header-content">
                    <button onClick={handleBack} className="back-button">
                        &larr; Назад
                    </button>
                    <h1>{product.product_name}</h1>
                </div>
            </header>

            <main className="product-main">
                <section className="product-details">
                    <div className="product-left">
                        <div className="product-image-container">
                            <img src={product.product_image} alt={product.product_name}/>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="add-to-cart-btn"
                        >
                            Добавить в корзину
                        </button>
                    </div>

                    <div className="product-right">
                        <div className="product-description">
                            <h2>Описание</h2>
                            <p>{product.product_description}</p>
                        </div>

                        <div className="product-price-section">
                            <span className="price">₽ {product.price.toLocaleString()}</span>
                        </div>

                        <div className="reviews-section">
                            <h3>Отзывы о товаре</h3>

                            {reviews.length > 0 ? (
                                <div className="reviews-list">
                                    {reviews.map(review => (
                                        <div key={review.review_id} className="review-item">
                                            <div className="review-header">
                                                <span className="review-user">{review.user_name}</span>
                                                <span className="review-date">
                                                    {new Date(review.date_of_review).toLocaleDateString()}
                                                </span>
                                                <div className="review-rating">
                                                    {'★'.repeat(review.grade)}{'☆'.repeat(5 - review.grade)}
                                                </div>
                                                {user?.role_id === 1 && (
                                                    <button
                                                        onClick={() => handleDeleteReview(review.review_id)}
                                                        className="delete-review-btn"
                                                    >
                                                        Удалить
                                                    </button>
                                                )}
                                            </div>
                                            <p className="review-comment">{review.comment_content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-reviews">Пока нет отзывов. Будьте первым!</p>
                            )}

                            <form onSubmit={handleSubmitReview} className="review-form">
                                <h4>Оставить отзыв</h4>

                                <div className="rating-container">
                                    <p>Оцените товар:</p>
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <React.Fragment key={star}>
                                                <input
                                                    type="radio"
                                                    id={`star${star}`}
                                                    name="rating"
                                                    value={star}
                                                    checked={rating === star}
                                                    onChange={() => setRating(star)}
                                                />
                                                <label
                                                    htmlFor={`star${star}`}
                                                    onMouseEnter={() => setHover(star)}
                                                    onMouseLeave={() => setHover(0)}
                                                >
                                                    {star <= (hover || rating) ? '★' : '☆'}
                                                </label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>

                                <div className="comment-container">
                                    <textarea
                                        placeholder="Ваш отзыв..."
                                        rows="4"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    ></textarea>
                                </div>

                                <button type="submit" disabled={!user} className="submit-review-btn">
                                    {user ? 'Отправить отзыв' : 'Войдите, чтобы оставить отзыв'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="product-footer">
                <p>© 2025 TechStore. Все права защищены.</p>
            </footer>
        </div>
    );
}

export default ProductPage;