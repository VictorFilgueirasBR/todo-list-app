// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import PrivateRoute from './components/PrivateRoute';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Home from './pages/Home';
import SettingsPopup from './components/SettingsPopup';
import { Toaster } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import api from './services/api'; // ✅ NOVO: Importa a instância 'api' para fazer a requisição de perfil

function App() {
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [popupSection, setPopupSection] = useState('main');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null); // Estado para a imagem de perfil

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setUsername(decodedToken.username || '');
          
          // ✅ ADICIONADO/REFORÇADO: Carrega a profileImage do localStorage na inicialização do App
          const storedProfileImage = localStorage.getItem('profileImage');
          if (storedProfileImage) {
            setProfileImage(storedProfileImage);
          } else {
            // Se não houver imagem no localStorage, tenta buscar do backend
            // Isso cobre o caso de um login recente onde a imagem ainda não foi salva no localStorage
            const fetchProfileImageOnAppMount = async () => {
              try {
                const res = await api.get(`/auth/profile`);
                if (res.data.profileImage) {
                  const fullImageUrl = `${api.defaults.baseURL}${res.data.profileImage}`;
                  setProfileImage(fullImageUrl);
                  localStorage.setItem('profileImage', fullImageUrl); // Salva para futuras recargas
                } else {
                  setProfileImage(null);
                  localStorage.removeItem('profileImage');
                }
              } catch (err) {
                console.error('Erro ao carregar profileImage na montagem do App:', err);
                setProfileImage(null);
                localStorage.removeItem('profileImage');
              }
            };
            fetchProfileImageOnAppMount();
          }

        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('profileImage'); // Limpa também a imagem
          setIsLoggedIn(false);
          setUsername('');
          setProfileImage(null);
        }
      } catch (error) {
        console.error("Erro ao decodificar token ou token inválido:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('profileImage'); // Limpa também a imagem
        setIsLoggedIn(false);
        setUsername('');
        setProfileImage(null);
      }
    } else {
      setIsLoggedIn(false);
      setUsername('');
      setProfileImage(null);
    }
  }, []);

  const handleLoginSuccess = useCallback(async (token) => { // ✅ ADICIONADO 'async'
    localStorage.setItem('token', token);
    
    try {
      const decodedToken = jwtDecode(token);
      const extractedUsername = decodedToken.username || '';
      localStorage.setItem('username', extractedUsername);
      setUsername(extractedUsername);
      setIsLoggedIn(true);

      // ✅ ADICIONADO: Busca a imagem de perfil do backend APÓS o login bem-sucedido
      // Isso garante que a imagem seja carregada e persistida no localStorage
      // imediatamente após o login, sem depender de um upload ou recarga.
      try {
        const res = await api.get(`/auth/profile`);
        if (res.data.profileImage) {
          const fullImageUrl = `${api.defaults.baseURL}${res.data.profileImage}`;
          setProfileImage(fullImageUrl);
          localStorage.setItem('profileImage', fullImageUrl); // Salva para futuras recargas
        } else {
          setProfileImage(null);
          localStorage.removeItem('profileImage');
        }
      } catch (err) {
        console.error('Erro ao buscar profileImage após login:', err);
        setProfileImage(null);
        localStorage.removeItem('profileImage');
      }

    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('profileImage');
      setIsLoggedIn(false);
      setUsername('');
      setProfileImage(null);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('profileImage'); // Limpa também a imagem ao fazer logout
    setUsername('');
    setProfileImage(null);
    setIsLoggedIn(false);
  }, []);

  const handleOpenSettingsFromParent = (section = 'main') => {
    setPopupSection(section);
    setShowSettingsPopup(true);
  };

  return (
    <Router>
      <Header
        isLoggedIn={isLoggedIn}
        onOpenSettings={handleOpenSettingsFromParent}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            <Login 
              onLoginSuccess={handleLoginSuccess}
            />
          } 
        />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile
                showPopup={showSettingsPopup}
                setShowPopup={setShowSettingsPopup}
                popupSection={popupSection}
                setPopupSection={setPopupSection}
                username={username}
                setUsername={setUsername}
                profileImage={profileImage}
                setProfileImage={setProfileImage}
              />
            </PrivateRoute>
          }
        />
      </Routes>

      {showSettingsPopup && (
        <SettingsPopup
          onClose={() => setShowSettingsPopup(false)}
          username={username}
          setUsername={setUsername}
          profileImage={profileImage}
          setProfileImage={setProfileImage}
          initialSection={popupSection}
          setInitialSection={setPopupSection}
        />
      )}
      <Toaster />
    </Router>
  );
}

export default App;
