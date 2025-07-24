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
// import api from './services/api'; // ❌ REMOVIDO: Não precisamos mais do api aqui para buscar perfil

function App() {
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [popupSection, setPopupSection] = useState('main');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          // ✅ REMOVIDO: Carregamento de username e profileImage do localStorage aqui.
          // O Profile.js agora será responsável por buscar essas informações do backend.
          // setUsername(decodedToken.username || ''); 
          // const storedProfileImage = localStorage.getItem('profileImage');
          // if (storedProfileImage) {
          //   setProfileImage(storedProfileImage);
          // }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('profileImage');
          setIsLoggedIn(false);
          setUsername('');
          setProfileImage(null);
        }
      } catch (error) {
        console.error("Erro ao decodificar token ou token inválido:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('profileImage');
        setIsLoggedIn(false);
        setUsername('');
        setProfileImage(null);
      }
    } else {
      setIsLoggedIn(false);
      setUsername('');
      setProfileImage(null);
    }
  }, []); // As dependências vazias ([]) garantem que ele roda apenas uma vez na montagem.

  const handleLoginSuccess = useCallback((token) => { // ✅ REMOVIDO 'async'
    localStorage.setItem('token', token);
    
    try {
      const decodedToken = jwtDecode(token);
      const extractedUsername = decodedToken.username || '';
      localStorage.setItem('username', extractedUsername); // ✅ Mantém salvando o username
      setUsername(extractedUsername); // ✅ Mantém atualizando o username
      setIsLoggedIn(true);

      // ❌ REMOVIDO: Lógica de busca de profileImage após login.
      // Agora o Profile.js fará essa busca quando for montado.
      // try { ... } catch (err) { ... }

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
