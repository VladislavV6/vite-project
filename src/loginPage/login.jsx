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
        <div className="login-page">
            <header className="login-header">
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>

            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Вход</h2>
                    {error && <div className="login-error">{error}</div>}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-form-group">
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
                        <div className="login-form-group">
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
                            <div className="login-form-group">
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

                        <button type="submit" className="login-submit-btn">
                            Войти
                        </button>
                    </form>

                    <p className="login-toggle">
                        {isAdminLogin ? (
                            <span>
                                Войти как <span
                                className="login-toggle-link"
                                onClick={() => setIsAdminLogin(false)}
                            >
                                    покупатель
                                </span>
                            </span>
                        ) : (
                            <span>
                                Войти как <span
                                className="login-toggle-link"
                                onClick={() => setIsAdminLogin(true)}
                            >
                                    администратор
                                </span>
                            </span>
                        )}
                    </p>

                    <p className="login-redirect">
                        Нет аккаунта? <a href="/registration" className="login-register-link">Зарегистрируйтесь</a>
                    </p>
                </div>
            </div>

            <footer className="login-footer">
                <p>© 2025 TechStore. Все права защищены.</p>
                <p>Магазин электроники для дома и бизнеса</p>
            </footer>
        </div>
    );
}

export default LoginPage;