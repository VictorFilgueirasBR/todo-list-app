// src/components/Header.js
import React, { useState } from 'react';
import './Header.css'; // Se for usar CSS

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      {/* Logo */}
      <img src="/images/logo.png" alt="Logo do Projeto" className="logo" />

      {/* Menu Hamburguer */}
      <div className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Menu Responsivo */}
      {isMenuOpen && (
        <nav className="nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">Sobre</a></li>
            <li><a href="/contact">Contato</a></li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
