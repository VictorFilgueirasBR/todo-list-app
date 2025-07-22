// src/components/Header.js
import React, { useState } from "react";
import "./Header.css";
import Sidebar from "./Sidebar"; // Importando o menu lateral
import { Link } from "react-router-dom";

// ✅ Receber a nova prop 'onLogout' do App.js
const Header = ({ isLoggedIn, onOpenSettings, onLogout }) => { // <-- Alterado aqui
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      {/* Logo */}
      <Link to="/">
        <img src="/images/logo.png" alt="Logo do Projeto" className="logo" />
      </Link>

      {/* Menu Hamburguer */}
      <div className="hamburger-menu" onClick={toggleMenu}>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
      </div>

      {/* Sidebar (Menu Lateral) */}
      {/* ✅ Passar a nova prop 'onLogout' para o Sidebar */}
      <Sidebar
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        isLoggedIn={isLoggedIn}     // Passando status de login
        onOpenSettings={onOpenSettings} // Passando a função para abrir o popup
        onLogout={onLogout}          // <-- Nova prop passada para o Sidebar
      />
    </header>
  );
};

export default Header;