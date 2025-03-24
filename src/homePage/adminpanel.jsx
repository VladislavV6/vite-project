import React, { useState } from 'react';
import AddProductForm from './addproduct.jsx';
import OrdersManagement from './ordersmanagement.jsx';
import "./style.css";

function AdminPanel({ onProductAdded }) {
    const [showAddProductForm, setShowAddProductForm] = useState(false);

    return (
        <div>
            <h2>Админ-панель</h2>
            <div className="admin-actions">
                <button onClick={() => setShowAddProductForm(!showAddProductForm)}>
                    {showAddProductForm ? 'Скрыть форму добавления товара' : 'Добавить товар'}
                </button>
            </div>

            {showAddProductForm && <AddProductForm onProductAdded={onProductAdded} onCancel={() => setShowAddProductForm(false)} />}

            <OrdersManagement />
        </div>
    );
}

export default AdminPanel;