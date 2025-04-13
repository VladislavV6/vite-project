// addproduct.jsx
import React, { useState } from 'react';
import { useAddProductMutation } from '../store/slices/apiSlice.js';
import "./style.css";

function AddProductForm({ onCancel, onProductAdded }) {
    const [productName, setProductName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productImage, setProductImage] = useState('');
    const [errors, setErrors] = useState({});

    const [addProduct, { isLoading }] = useAddProductMutation();

    const validateForm = () => {
        const newErrors = {};
        if (!productName.trim()) newErrors.productName = 'Название обязательно';
        if (!categoryId) newErrors.categoryId = 'Выберите категорию';
        if (!price || isNaN(price) || parseFloat(price) <= 0) newErrors.price = 'Введите корректную цену';
        if (!productImage.trim() || !/^https?:\/\/.+\..+/.test(productImage)) {
            newErrors.productImage = 'Введите корректный URL изображения';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const productData = {
            product_name: productName.trim(),
            category_id: parseInt(categoryId, 10),
            price: parseFloat(price),
            product_description: productDescription.trim(),
            product_image: productImage.trim(),
        };

        try {
            await addProduct(productData).unwrap();
            alert('Продукт успешно добавлен!');
            onProductAdded();
            onCancel();
        } catch (err) {
            console.error('Ошибка при добавлении продукта:', err);
            alert(`Ошибка при добавлении продукта: ${err.data?.message || err.message}`);
        }
    };

    return (
        <div className="modal-overlay" data-testid="add-product-modal">
            <div className="product-form-modal">
                <div className="modal-header">
                    <h2 className="modal-title">Добавить новый товар</h2>
                    <button
                        onClick={onCancel}
                        className="close-btn"
                        aria-label="Закрыть форму добавления товара"
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="product-form" noValidate>
                    <div className={`form-field ${errors.productName ? 'error' : ''}`}>
                        <label htmlFor="productName">Название товара*</label>
                        <input
                            id="productName"
                            type="text"
                            placeholder="Введите название товара"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            aria-invalid={!!errors.productName}
                            aria-describedby="productNameError"
                        />
                        {errors.productName && (
                            <span id="productNameError" className="error-message">{errors.productName}</span>
                        )}
                    </div>

                    <div className={`form-field ${errors.categoryId ? 'error' : ''}`}>
                        <label htmlFor="categoryId">Категория*</label>
                        <input
                            id="categoryId"
                            type="number"
                            placeholder="Введите ID категории"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            min="1"
                            aria-invalid={!!errors.categoryId}
                            aria-describedby="categoryIdError"
                        />
                        {errors.categoryId && (
                            <span id="categoryIdError" className="error-message">{errors.categoryId}</span>
                        )}
                    </div>

                    <div className={`form-field ${errors.price ? 'error' : ''}`}>
                        <label htmlFor="price">Цена*</label>
                        <div className="price-input-wrapper">
                            <input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Введите цену"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                aria-invalid={!!errors.price}
                                aria-describedby="priceError"
                            />
                            <span className="currency">₽</span>
                        </div>
                        {errors.price && (
                            <span id="priceError" className="error-message">{errors.price}</span>
                        )}
                    </div>

                    <div className="form-field">
                        <label htmlFor="productDescription">Описание</label>
                        <textarea
                            id="productDescription"
                            placeholder="Введите описание товара"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            rows="4"
                            aria-describedby="descriptionHelp"
                        />
                        <small id="descriptionHelp" className="help-text">Необязательное поле</small>
                    </div>

                    <div className={`form-field ${errors.productImage ? 'error' : ''}`}>
                        <label htmlFor="productImage">Ссылка на изображение*</label>
                        <input
                            id="productImage"
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={productImage}
                            onChange={(e) => setProductImage(e.target.value)}
                            required
                            aria-invalid={!!errors.productImage}
                            aria-describedby="productImageError"
                        />
                        {errors.productImage && (
                            <span id="productImageError" className="error-message">{errors.productImage}</span>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="cancel-btn"
                            disabled={isLoading}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner"></span>
                            ) : (
                                'Сохранить товар'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductForm;