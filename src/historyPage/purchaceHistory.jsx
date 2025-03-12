import React from 'react';
import "./style.css"

const PurchaseHistory = () => {
    const purchases = [
        { id: 1, date: '2023-10-01', total: '₽ 40,000', items: ['Смартфон XYZ'] },
        { id: 2, date: '2023-09-25', total: '₽ 80,000', items: ['Ноутбук ABC'] },
        { id: 3, date: '2023-09-20', total: '₽ 12,000', items: ['Наушники DEF'] },
    ];

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>
    <div className="purchase-history">
            <h2>История покупок</h2>
            <table>
                <thead>
                <tr>
                    <th>Дата</th>
                    <th>Товары</th>
                    <th>Сумма</th>
                </tr>
                </thead>
                <tbody>
                {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                        <td>{purchase.date}</td>
                        <td>
                            <ul>
                                {purchase.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </td>
                        <td>{purchase.total}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default PurchaseHistory;