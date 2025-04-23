import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './store/slices/authSlice';
import "./style.css"

function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <nav>
            <div className="nav-left">
                <Link to="/">Главная</Link>
                <Link to="/catalog">Каталог</Link>
                <Link to="/favorites">Избранное</Link>
                <Link to="/purchase-history">История покупок</Link>
                <Link to="/cart">Корзина</Link>
                <Link to="/support">Техподдержка</Link>
            </div>
    <div className="nav-right">
        {isAuthenticated ? (
            <>
                <span><Link to="/orders">{user.name}</Link></span> {}
                <button onClick={handleLogout}>Выйти</button>
                {}
            </>
        ) : (
            <>
                <Link to="/login">Вход</Link>
                <Link to="/registration">Регистрация</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;