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
        <form className="product-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Название товара"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="Номер категории"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
            />
            <input
                type="number"
                step="0.01"
                placeholder="Цена"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />
            <textarea
                placeholder="Описание"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
            />
            <input
                type="url"
                placeholder="Ссылка на изображение"
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                required
            />
            <div className="form-buttons">
                <button type="submit">Сохранить</button>
                <button type="button" onClick={onCancel}>Отмена</button>
            </div>
        </form>
    );
}

export default AddProductForm;