// src/components/Sidebar.js

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


import "./Sidebar.css";

// ✅ Adicionar 'onLogout' às props que o Sidebar recebe
const Sidebar = ({ isMenuOpen, toggleMenu, isLoggedIn, onOpenSettings, onLogout }) => { // <-- Alterado aqui
  const navigate = useNavigate();

  // A linha `const isLoggedIn = !!localStorage.getItem('token');` já foi removida como planejado.
  // Isso garante que o estado de login vem do componente pai (App.js), que é o lugar correto.

  const handleLogout = () => {
    // ✅ Chamar a função onLogout passada pelo App.js (via Header)
    if (onLogout) { // Garante que a prop existe antes de chamar
        onLogout(); // Chama a função de logout centralizada no App.js
    }
    toggleMenu();   // fecha o menu ao clicar
    navigate('/');  // Redireciona para a home
  };

  // ✅ Nova função para lidar com o clique no botão de configurações
  const handleOpenSettingsClick = () => {
    if (onOpenSettings) { // Garante que a prop existe antes de chamar
      onOpenSettings();   // Chama a função passada pelo App.js
    }
    toggleMenu();         // Fecha o menu lateral
  };

  // Fecha o menu ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        !event.target.closest(".sidebar") &&
        !event.target.closest(".hamburger-menu")
      ) {
        toggleMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, toggleMenu]);

  return (
    <nav className={`sidebar ${isMenuOpen ? "open" : ""}`} aria-hidden={!isMenuOpen}>
      <ul>
        <li>
          <Link to="/" onClick={toggleMenu}>Home</Link>
        </li>

        {isLoggedIn ? (
          <>
            <li>
              <Link to="/profile" onClick={toggleMenu}>Profile</Link>
            </li>
            {/* ✅ Botão de Configurações, visível apenas para usuários logados */}
            <li>
              <button onClick={handleOpenSettingsClick} className="sidebar-button">
                Settings
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </li>
          </>
        ) : (
          // ✅ ALTERAÇÃO AQUI: Dividindo "Login / Sign Up" em duas opções separadas
          <>
            <li>
              <Link to="/login" onClick={toggleMenu}>Login</Link>
            </li>
            <li>
              <Link to="/signup" onClick={toggleMenu}>SignUp</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Sidebar;