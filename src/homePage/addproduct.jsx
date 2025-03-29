import React, { useState } from 'react';
import { useAddProductMutation } from '../store/slices/apiSlice.js';
import "./style.css";

function AddProductForm({ onCancel, onProductAdded }) {
    const [productName, setProductName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productImage, setProductImage] = useState('');

    const [addProduct] = useAddProductMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            product_name: productName,
            category_id: parseInt(categoryId, 10),
            price: parseFloat(price),
            product_description: productDescription,
            product_image: productImage,
        };

        try {
            await addProduct(productData).unwrap();
            alert('Продукт успешно добавлен!');
            onProductAdded();
            onCancel();
        } catch (err) {
            console.error('Ошибка при добавлении продукта:', err);
            alert('Ошибка при добавлении продукта');
        }
    };

    return (
        <div className="add-product-modal">
            <div className="add-product-container">
                <h2 className="add-product-title">Добавить новый товар</h2>
                <form className="add-product-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="productName">Название товара</label>
                        <input
                            id="productName"
                            type="text"
                            placeholder="Введите название товара"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoryId">Категория</label>
                        <input
                            id="categoryId"
                            type="number"
                            placeholder="Введите номер категории"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">Цена</label>
                        <input
                            id="price"
                            type="number"
                            step="0.01"
                            placeholder="Введите цену"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="productDescription">Описание</label>
                        <textarea
                            id="productDescription"
                            placeholder="Введите описание товара"
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="productImage">Ссылка на изображение</label>
                        <input
                            id="productImage"
                            type="url"
                            placeholder="Введите URL изображения"
                            value={productImage}
                            onChange={(e) => setProductImage(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button">
                            Сохранить товар
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="cancel-button"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProductForm;