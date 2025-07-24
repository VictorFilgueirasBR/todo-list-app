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

function App() {
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [popupSection, setPopupSection] = useState('main');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    console.log("App.js useEffect: Iniciando carregamento de dados...");
    const token = localStorage.getItem('token');
    console.log("App.js useEffect: Token do localStorage:", token);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("App.js useEffect: Token decodificado:", decodedToken);

        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          const extractedUsername = decodedToken.username || '';
          setUsername(extractedUsername);
          console.log("App.js useEffect: Nome de usuário definido do token:", extractedUsername);

          const storedProfileImage = localStorage.getItem('profileImage');
          if (storedProfileImage) {
            setProfileImage(storedProfileImage);
            console.log("App.js useEffect: Imagem de perfil definida do localStorage:", storedProfileImage);
          } else {
            console.log("App.js useEffect: Nenhuma imagem de perfil encontrada no localStorage.");
          }
        } else {
          console.log("App.js useEffect: Token expirado. Limpando dados.");
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('profileImage');
          setIsLoggedIn(false);
          setUsername('');
          setProfileImage(null);
        }
      } catch (error) {
        console.error("App.js useEffect: Erro ao decodificar token ou token inválido:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('profileImage');
        setIsLoggedIn(false);
        setUsername('');
        setProfileImage(null);
      }
    } else {
      console.log("App.js useEffect: Nenhum token encontrado no localStorage.");
      setIsLoggedIn(false);
      setUsername('');
      setProfileImage(null);
    }
  }, []); // As dependências vazias ([]) garantem que ele roda apenas uma vez na montagem.

  const handleLoginSuccess = useCallback((token) => {
    localStorage.setItem('token', token);
    
    try {
      const decodedToken = jwtDecode(token);
      const extractedUsername = decodedToken.username || '';
      localStorage.setItem('username', extractedUsername);
      setUsername(extractedUsername);
      setIsLoggedIn(true);
      // Ao fazer login, a imagem de perfil será buscada pelo Profile.js
      // Não precisamos salvá-la aqui, pois o Profile.js já a definirá no estado global.
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
    localStorage.removeItem('profileImage');
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
