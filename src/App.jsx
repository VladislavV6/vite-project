import React from 'react';
import HomePage from './homePage/home.jsx';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegistrationPage from './authorizPage/registration.jsx';
import LoginPage from './loginPage/login.jsx';
import FavoritesPage from "./favoritePage/favorite.jsx";
import CartPage from "./cartPage/cart.jsx";
import Navbar from "./Navbar.jsx";
import ProductPage from "./productPage/product.jsx";
import PurchaseHistory from "./historyPage/purchaceHistory.jsx";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from './store/slices/authSlice';

function App() {

    const dispatch = useDispatch();
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            dispatch(login(user));
        }
    }, [dispatch]);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/catalog" element={<HomePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/registration" element={<RegistrationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/product/:productId" element={<ProductPage />} />
                <Route path="/purchase-history" element={<PurchaseHistory />} />
            </Routes>
        </Router>
    );
}

export default App;
