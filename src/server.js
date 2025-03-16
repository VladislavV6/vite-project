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

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
