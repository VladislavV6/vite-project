import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'techstore',
    password: '1',
    port: 5432,
});

app.get('/', (req, res) => {
    res.send('Добро пожаловать на сервер TechStore!');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "TechStore"."users" (name, email, password, role_id) VALUES ($1, $2, $3, 2) RETURNING *',
            [name, email, password]
        );

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password, adminPassword } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    try {
        const isAdmin = adminPassword === 'admin123';

        const result = await pool.query('SELECT * FROM "TechStore"."users" WHERE email = $1 AND password = $2', [email, password]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const user = result.rows[0];
        console.log('Найден пользователь:', user);

        const roleId = isAdmin ? 1 : 2;

        const updateResult = await pool.query(
            'UPDATE "TechStore"."users" SET role_id = $1 WHERE user_id = $2 RETURNING *',
            [roleId, user.user_id]
        );
        console.log('Обновленный пользователь:', updateResult.rows[0]);

        if (updateResult.rows.length === 0) {
            throw new Error('Не удалось обновить роль пользователя');
        }

        const updatedUser = updateResult.rows[0];
        console.log('Пользователь обновлен:', updatedUser);

        res.status(200).json({
            message: 'Вход выполнен успешно',
            user: {
                ...updatedUser,
                role_id: Number(updatedUser.role_id)
            }
        });
    } catch (err) {
        console.error('Ошибка при входе:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.post('/add-product', async (req, res) => {
    const { product_name, category_id, price, product_description, product_image } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO "TechStore"."products" (product_name, category_id, price, product_description, product_image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [product_name, category_id, price, product_description, product_image]
        );

        res.status(201).json({ message: 'Продукт успешно добавлен', product: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.get('/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM "TechStore"."products"');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении товаров:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.get('/products/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM "TechStore"."products" WHERE product_id = $1',
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Ошибка при получении товара:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.post('/favorites', async (req, res) => {
    const { user_id, product_id } = req.body;

    try {
        const existingFavorite = await pool.query(
            'SELECT * FROM "TechStore"."favorites" WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
        );

        if (existingFavorite.rows.length > 0) {
            return res.status(400).json({ message: 'Товар уже в избранном' });
        }

        const result = await pool.query(
            'INSERT INTO "TechStore"."favorites" (user_id, product_id) VALUES ($1, $2) RETURNING *',
            [user_id, product_id]
        );

        res.status(201).json({ message: 'Товар добавлен в избранное', favorite: result.rows[0] });
    } catch (err) {
        console.error('Ошибка при добавлении в избранное:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.delete('/favorites', async (req, res) => {
    const { user_id, product_id } = req.body;

    try {
        const result = await pool.query(
            'DELETE FROM "TechStore"."favorites" WHERE user_id = $1 AND product_id = $2 RETURNING *',
            [user_id, product_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Товар не найден в избранном' });
        }

        res.status(200).json({ message: 'Товар удален из избранного', favorite: result.rows[0] });
    } catch (err) {
        console.error('Ошибка при удалении из избранного:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.get('/favorites/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT p.* FROM "TechStore"."favorites" f
             JOIN "TechStore"."products" p ON f.product_id = p.product_id
             WHERE f.user_id = $1`,
            [user_id]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка при получении избранных товаров:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.post('/cart', async (req, res) => {
    const { user_id, product_id, quantity_of_products } = req.body;

    try {
        const quantity = parseInt(quantity_of_products, 10);
        if (isNaN(quantity)) {
            return res.status(400).json({ message: 'Некорректное количество товара' });
        }

        const existingCartItem = await pool.query(
            'SELECT * FROM "TechStore"."cart" WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
        );

        if (existingCartItem.rows.length > 0) {
            const currentQuantity = parseInt(existingCartItem.rows[0].quantity_of_products, 10);
            const updatedQuantity = currentQuantity + quantity;

            const result = await pool.query(
                'UPDATE "TechStore"."cart" SET quantity_of_products = $1 WHERE cart_id = $2 RETURNING *',
                [updatedQuantity, existingCartItem.rows[0].cart_id]
            );
            res.status(200).json({ message: 'Количество товара обновлено', cartItem: result.rows[0] });
        } else {
            const result = await pool.query(
                'INSERT INTO "TechStore"."cart" (user_id, product_id, quantity_of_products, date_added) VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *',
                [user_id, product_id, quantity]
            );
            res.status(201).json({ message: 'Товар добавлен в корзину', cartItem: result.rows[0] });
        }
    } catch (err) {
        console.error('Ошибка при добавлении в корзину:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.delete('/cart', async (req, res) => {
    const { user_id, product_id } = req.body;

    try {
        const result = await pool.query(
            'DELETE FROM "TechStore"."cart" WHERE user_id = $1 AND product_id = $2 RETURNING *',
            [user_id, product_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }

        res.status(200).json({ message: 'Товар удален из корзины', cartItem: result.rows[0] });
    } catch (err) {
        console.error('Ошибка при удалении из корзины:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.delete('/cart/clear', async (req, res) => {
    const { user_id } = req.body;

    try {
        const result = await pool.query(
            'DELETE FROM "TechStore"."cart" WHERE user_id = $1 RETURNING *',
            [user_id]
        );

        res.status(200).json({ message: 'Корзина очищена', deletedItems: result.rows });
    } catch (err) {
        console.error('Ошибка при очистке корзины:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.get('/cart/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT c.*, p.product_name, p.price, p.product_image 
             FROM "TechStore"."cart" c
             JOIN "TechStore"."products" p ON c.product_id = p.product_id
             WHERE c.user_id = $1`,
            [user_id]
        );

        const cartItems = result.rows.map(row => ({
            product: {
                product_id: row.product_id,
                product_name: row.product_name,
                price: row.price,
                product_image: row.product_image
            },
            quantity: row.quantity_of_products
        }));

        res.status(200).json(cartItems);
    } catch (err) {
        console.error('Ошибка при получении корзины:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.put('/cart', async (req, res) => {
    const { user_id, product_id, quantity_of_products } = req.body;

    try {
        const result = await pool.query(
            'UPDATE "TechStore"."cart" SET quantity_of_products = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
            [quantity_of_products, user_id, product_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Товар не найден в корзине' });
        }

        res.status(200).json({ message: 'Количество товара обновлено', cartItem: result.rows[0] });
    } catch (err) {
        console.error('Ошибка при обновлении количества товара:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

app.post('/orders', async (req, res) => {
    const { user_id, order_amount, items } = req.body;

    try {
        await pool.query('BEGIN');

        const orderResult = await pool.query(
            `INSERT INTO "TechStore"."orders" (user_id, order_amount, date_of_order)
             VALUES ($1, $2, CURRENT_DATE)
             RETURNING *`,
            [user_id, order_amount]
        );

        const orderId = orderResult.rows[0].order_id;

        for (const item of items) {
            await pool.query(
                `INSERT INTO "TechStore"."order_composition" (order_id, product_id, product_count)
                 VALUES ($1, $2, $3)`,
                [orderId, item.product_id, item.product_count]
            );
        }

        await pool.query('DELETE FROM "TechStore"."cart" WHERE user_id = $1', [user_id]);
        await pool.query('COMMIT');

        res.status(201).json({ message: 'Заказ успешно создан', order: orderResult.rows[0] });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Ошибка при создании заказа:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});


app.get('/orders/:user_id', async (req, res) => {
    const { user_id } = req.params;

    if (!user_id || isNaN(parseInt(user_id))) {
        return res.status(400).json({
            message: 'Неверный ID пользователяя',
            error: `Получен user_id: ${user_id}`
        });
    }

    try {
        const result = await pool.query(
            `SELECT o.*, 
                    json_agg(json_build_object(
                        'product_id', oc.product_id,
                        'product_count', oc.product_count,
                        'price', p.price
                    )) AS items
             FROM "TechStore"."orders" o
             LEFT JOIN "TechStore"."order_composition" oc ON o.order_id = oc.order_id
             LEFT JOIN "TechStore"."products" p ON oc.product_id = p.product_id
             WHERE o.user_id = $1
             GROUP BY o.order_id`,
            [parseInt(user_id)]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка SQL запроса:', {
            query: `SELECT...WHERE user_id = ${user_id}`,
            error: err
        });
        res.status(500).json({
            message: 'Ошибка сервера',
            error: err.message,
            details: err.detail
        });
    }
});

app.get('/orders/admin', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, 'your_secret_key');
        if (decoded.role_id !== 1) {
            return res.status(403).json({ message: 'Требуются права администратора' });
        }

        const result = await pool.query(`
            SELECT 
                o.*,
                json_agg(json_build_object(
                    'product_id', oc.product_id,
                    'product_count', oc.product_count,
                    'price', p.price
                )) AS items
            FROM "TechStore"."orders" o
            JOIN "TechStore"."order_composition" oc ON o.order_id = oc.order_id
            JOIN "TechStore"."products" p ON oc.product_id = p.product_id
            GROUP BY o.order_id
            ORDER BY o.date_of_order DESC
        `);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Ошибка получения заказов:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.patch('/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Требуется авторизация' });
        }

        const decoded = jwt.verify(token, 'your_secret_key');
        if (decoded.role_id !== 1) {
            return res.status(403).json({ message: 'Требуются права администратора' });
        }

        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Неверный статус заказа' });
        }

        await pool.query(
            'UPDATE "TechStore"."orders" SET status = $1 WHERE order_id = $2',
            [status, orderId]
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Ошибка обновления:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
