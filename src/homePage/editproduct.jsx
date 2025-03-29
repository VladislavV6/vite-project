import React, { useState } from 'react';
import { useUpdateProductMutation, useGetCategoriesQuery } from '../store/slices/apiSlice.js';
import "./style.css";

function EditProductForm({ product, onCancel, onProductUpdated }) {
    const [productName, setProductName] = useState(product.product_name);
    const [categoryId, setCategoryId] = useState(product.category_id);
    const [price, setPrice] = useState(product.price);
    const [productDescription, setProductDescription] = useState(product.product_description);
    const [productImage, setProductImage] = useState(product.product_image);

    const [updateProduct] = useUpdateProductMutation();
    const { data: categories = [] } = useGetCategoriesQuery();

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
            await updateProduct({ productId: product.product_id, productData }).unwrap();
            alert('Продукт успешно обновлен!');
            onProductUpdated();
            onCancel();
        } catch (err) {
            console.error('Ошибка при обновлении продукта:', err);
            alert('Ошибка при обновлении продукта');
        }
    };

    return (
        <div className="edit-product-modal">
            <div className="edit-product-container">
                <h2 className="edit-product-title">Редактировать товар</h2>
                <form className="edit-product-form" onSubmit={handleSubmit}>
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
                        <select
                            id="categoryId"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            {categories.map(category => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
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
                            Сохранить изменения
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

export default EditProductForm;