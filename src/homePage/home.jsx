import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './style.css';

function HomePage() {
    const [hovered, setHovered] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="home-container">
            <div className="particles">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle"
                        initial={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: 0
                        }}
                        animate={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: [0, 0.5, 0],
                            transition: {
                                duration: 5 + Math.random() * 10,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }
                        }}
                    />
                ))}
            </div>

            <motion.div
                className="hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <motion.div
                    animate={{
                        y: scrollY * 0.5,
                        scale: 1 - scrollY * 0.001
                    }}
                    style={{ originX: 0.5 }}
                >
                    <motion.img
                        src="/logo.png"
                        alt="TechStore Logo"
                        className="logo"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 1 }}
                    />
                </motion.div>

                <motion.h1
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    Добро пожаловать в TechStore
                </motion.h1>

                <motion.p
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    Техника будущего уже сегодня
                </motion.p>

                <motion.div
                    onHoverStart={() => setHovered(true)}
                    onHoverEnd={() => setHovered(false)}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link to="/catalog" className="cta-button">
                        <motion.span
                            animate={{
                                color: hovered ? '#ffffff' : '#00b0f0'
                            }}
                        >
                            Перейти в каталог
                        </motion.span>
                        <motion.div
                            className="button-bg"
                            animate={{
                                width: hovered ? '100%' : '0%'
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </Link>
                </motion.div>
            </motion.div>

            <div className="features">
                <motion.div
                    className="feature-card"
                    whileHover={{ y: -10 }}
                >
                    <h3>🚀 Быстрая доставка</h3>
                    <p>Получите заказ уже на следующий день</p>
                </motion.div>

                <motion.div
                    className="feature-card"
                    whileHover={{ y: -10 }}
                >
                    <h3>🔒 Гарантия качества</h3>
                    <p>Все товары проходят проверку</p>
                </motion.div>

                <motion.div
                    className="feature-card"
                    whileHover={{ y: -10 }}
                >
                    <h3>💎 Эксклюзивные модели</h3>
                    <p>Только у нас уникальные устройства</p>
                </motion.div>
            </div>
        </div>
    );
}

export default HomePage;