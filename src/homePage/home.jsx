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
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle"
                        initial={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: 0,
                            scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: [0, 0.7, 0],
                            transition: {
                                duration: 5 + Math.random() * 15,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
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
                <motion.div className="hero-text">
                    <motion.h1
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        Добро пожаловать в <span className="highlight">TechStore</span>
                    </motion.h1>

                    <motion.p
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="subtitle"
                    >
                        Техника будущего уже сегодня
                    </motion.p>
                </motion.div>

                <motion.div
                    onHoverStart={() => setHovered(true)}
                    onHoverEnd={() => setHovered(false)}
                    whileTap={{ scale: 0.95 }}
                    className="button-container"
                >
                    <Link to="/catalog" className="cta-button">
                        <motion.span
                            animate={{
                                color: hovered ? '#ffffff' : '#3a86ff'
                            }}
                            className="button-text"
                        >
                            Перейти в каталог
                        </motion.span>
                        <motion.div
                            className="button-bg"
                            animate={{
                                width: hovered ? '100%' : '0%',
                                backgroundColor: hovered ? '#3a86ff' : '#8338ec'
                            }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        />
                    </Link>
                </motion.div>
            </motion.div>

            <div className="features-container">
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="section-title"
                >
                    Почему выбирают нас
                </motion.h2>

                <div className="features">
                    {[
                        {
                            icon: "🚀",
                            title: "Быстрая доставка",
                            description: "Получите заказ уже на следующий день"
                        },
                        {
                            icon: "🔒",
                            title: "Гарантия качества",
                            description: "Все товары проходят тщательную проверку"
                        },
                        {
                            icon: "💎",
                            title: "Эксклюзивные модели",
                            description: "Только у нас уникальные устройства"
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="feature-card"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                            whileHover={{
                                y: -10,
                                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)"
                            }}
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomePage;