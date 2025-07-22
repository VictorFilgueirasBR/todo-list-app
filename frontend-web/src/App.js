// src/App.js
import React, { useState, useEffect, useCallback } from 'react'; // ✅ Importar useState, useEffect e useCallback
import PrivateRoute from './components/PrivateRoute';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Home from './pages/Home';
import SettingsPopup from './components/SettingsPopup';
import { Toaster } from 'react-hot-toast';

function App() {
  // ✅ Estados centralizados para o SettingsPopup e dados do usuário
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [popupSection, setPopupSection] = useState('main'); // 'main', 'username', 'avatar'
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [profileImage, setProfileImage] = useState(null);

  // ✅ NOVO ESTADO: isLoggedIn agora é um estado gerenciado por React
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Inicia como false

  // ✅ useEffect para carregar username, profileImage e definir o status inicial de login
  // Este useEffect é executado uma vez na montagem do componente.
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Define isLoggedIn baseado na existência do token no localStorage
    // `!!token` converte o valor (string ou null) para booleano (true ou false)
    setIsLoggedIn(!!token); 
    
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    // No futuro, se houver um endpoint para buscar a imagem de perfil
    // na montagem do App, ele poderia ser chamado aqui.
    // Por enquanto, o Profile.js já busca essa info no seu próprio useEffect.
    // Mas é bom ter o estado centralizado aqui.
  }, []); // As dependências vazias ([]) garantem que ele roda apenas uma vez na montagem.

  // ✅ NOVA FUNÇÃO: Lidar com o login bem-sucedido
  // Esta função será passada para o componente Login.
  // `useCallback` é usado para memoizar a função, evitando que ela seja recriada
  // em cada renderização do App, o que é útil para otimização de componentes filhos.
  const handleLoginSuccess = useCallback((token, loggedInUsername) => {
    localStorage.setItem('token', token); // Salva o token JWT no localStorage
    localStorage.setItem('username', loggedInUsername); // Salva o username retornado do login no localStorage
    setUsername(loggedInUsername); // Atualiza o estado 'username' no App.js
    setIsLoggedIn(true); // Atualiza o estado 'isLoggedIn' para true, acionando a re-renderização
  }, []); // Dependências vazias, pois a função não depende de nenhum estado/prop que mude.

  // ✅ NOVA FUNÇÃO: Lidar com o logout
  // Esta função será passada para o componente Header (e depois Sidebar).
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token'); // Remove o token do localStorage
    localStorage.removeItem('username'); // Limpa o username do localStorage
    setUsername(''); // Limpa o estado 'username' no App.js
    setProfileImage(null); // Limpa a imagem de perfil do estado
    setIsLoggedIn(false); // Atualiza o estado 'isLoggedIn' para false, acionando a re-renderização
  }, []); // Dependências vazias.

  // Função para abrir o SettingsPopup de qualquer lugar (ex: Sidebar)
  const handleOpenSettingsFromParent = (section = 'main') => {
    setPopupSection(section); // Define a seção inicial do popup
    setShowSettingsPopup(true); // Exibe o popup
  };

  return (
    <Router>
      {/* ✅ Passar as props isLoggedIn e a nova handleLogout para o Header */}
      <Header
        isLoggedIn={isLoggedIn} // Passa o estado de login atualizado
        onOpenSettings={handleOpenSettingsFromParent} // Passa a função para abrir o popup de configurações
        onLogout={handleLogout} // ✅ Nova prop: passa a função de logout para o Header
      />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* ✅ Passar handleLoginSuccess para o componente Login */}
        <Route 
          path="/login" 
          element={
            <Login 
              onLoginSuccess={handleLoginSuccess} // Permite que o Login notifique o App sobre o sucesso
              setUsername={setUsername} // Permite que o Login atualize o username centralizado
            />
          } 
        />
        <Route path="/signup" element={<SignUp />} /> {/* SignUp ainda não atualiza isLoggedIn diretamente, mas pode ser adicionado de forma similar se necessário */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              {/* ✅ Passar os estados e setters necessários para o Profile */}
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

      {/* ✅ Renderizar o SettingsPopup condicionalmente no App.js */}
      {showSettingsPopup && (
        <SettingsPopup
          onClose={() => setShowSettingsPopup(false)} // Função para fechar o popup
          username={username}
          setUsername={setUsername}
          setProfileImage={setProfileImage}
          initialSection={popupSection} // Define a seção inicial para o popup
          setInitialSection={setPopupSection} // Permite que o popup resete a seção ao fechar/salvar
        />
      )}
      <Toaster /> {/* Componente da biblioteca react-hot-toast para exibir mensagens */}
    </Router>
  );
}

export default App;