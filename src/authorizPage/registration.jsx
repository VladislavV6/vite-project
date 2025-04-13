import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from "../store/slices/apiSlice.js";
import "./style.css"

function RegistrationPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [registerUser, { isLoading }] = useRegisterUserMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const response = await registerUser({ name, email, password }).unwrap();
            alert(response.message);
            navigate('/login');
        } catch (err) {
            setError(err.data?.message || 'Ошибка при регистрации');
        }
    };

    return (
        <div className="registration-page">
            <header className="registration-header">
                <h1>TechStore</h1>
                <p>Техника для дома и бизнеса</p>
            </header>

            <div className="registration-container">
                <div className="registration-card">
                    <h2 className="registration-title">Регистрация</h2>
                    {error && <div className="registration-error">{error}</div>}
                    <form className="registration-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Имя:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Введите ваше имя"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                        <div className="form-group">
                            <label htmlFor="confirm-password">Подтвердите пароль:</label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                placeholder="Подтвердите пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                        </button>
                    </form>
                    <p className="login-redirect">
                        Уже есть аккаунт? <a href="/login" className="login-link">Войдите</a>
                    </p>
                </div>
            </div>

            <footer className="registration-footer">
                <p>© 2025 TechStore. Все права защищены.</p>
                <p>Магазин электроники для дома и бизнеса</p>
            </footer>
        </div>
    );
}

export default RegistrationPage;