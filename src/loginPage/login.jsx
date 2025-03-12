import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../store/slices/apiSlice';
import { login } from '../store/slices/authSlice';
import "./style.css";

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [error, setError] = useState('');
    const [loginUser] = useLoginUserMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                email,
                password,
                adminPassword: isAdminLogin ? adminPassword : undefined,
            };

            console.log('Отправляемые данные:', payload);
            const response = await loginUser(payload).unwrap();
            console.log('Ответ сервера:', response.user);
            dispatch(login(response.user));
            navigate('/');
        } catch (err) {
            setError(err.data?.message || 'Ошибка при входе');
        }
    };

    return (
        <div>
            <header>
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>

            <section className="login-form">
                <h2>Вход</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Введите ваш email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Пароль:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Введите пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {isAdminLogin && (
                        <div className="form-group">
                            <label htmlFor="adminPassword">Пароль администратора:</label>
                            <input
                                type="password"
                                id="adminPassword"
                                name="adminPassword"
                                placeholder="Введите пароль администратора"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit">Войти</button>
                </form>

                <p>
                    {isAdminLogin ? (
                        <span>
                            Войти как <a href="#" onClick={() => setIsAdminLogin(false)}>покупатель</a>
                        </span>
                    ) : (
                        <span>
                            Войти как <a href="#" onClick={() => setIsAdminLogin(true)}>администратор</a>
                        </span>
                    )}
                </p>

                <p>
                    Нет аккаунта? <a href="/registration">Зарегистрируйтесь</a>
                </p>
            </section>

            <footer>
                <p>2025 Магазин Электроники</p>
                <p>Все права защищены</p>
            </footer>
        </div>
    );
}

export default LoginPage;