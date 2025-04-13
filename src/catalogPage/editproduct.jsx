// editproduct.jsx
import React, { useState } from 'react';
import { useUpdateProductMutation, useGetCategoriesQuery } from '../store/slices/apiSlice.js';
import "./style.css";

function EditProductForm({ product, onCancel, onSave, categories }) {
    const [productName, setProductName] = useState(product.product_name);
    const [categoryId, setCategoryId] = useState(product.category_id);
    const [price, setPrice] = useState(product.price);
    const [productDescription, setProductDescription] = useState(product.product_description);
    const [productImage, setProductImage] = useState(product.product_image);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);

        const productData = {
            product_name: productName.trim(),
            category_id: parseInt(categoryId, 10),
            price: parseFloat(price),
            product_description: productDescription.trim(),
            product_image: productImage.trim(),
        };

        const success = await onSave(product.product_id, productData);
        setIsSubmitting(false);

        if (success) {
            onCancel();
        }
    };

    return (
        <div className="modal-overlay" data-testid="edit-product-modal">
            <div className="product-form-modal">
                <div className="modal-header">
                    <h2 className="modal-title">Редактировать товар</h2>
                    <button
                        onClick={onCancel}
                        className="close-btn"
                        aria-label="Закрыть форму редактирования"
                        disabled={isSubmitting}
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
                        <select
                            id="categoryId"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                            aria-invalid={!!errors.categoryId}
                            aria-describedby="categoryIdError"
                        >
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
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
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="spinner"></span>
                            ) : (
                                'Сохранить изменения'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProductForm;