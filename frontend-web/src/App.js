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
import { jwtDecode } from 'jwt-decode'; // ✅ NOVO: Importa a biblioteca jwt-decode

function App() {
  // ✅ Estados centralizados para o SettingsPopup e dados do usuário
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [popupSection, setPopupSection] = useState('main'); // 'main', 'username', 'avatar'
  const [username, setUsername] = useState(''); // Inicia como string vazia
  const [profileImage, setProfileImage] = useState(null);

  // ✅ NOVO ESTADO: isLoggedIn agora é um estado gerenciado por React
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Inicia como false

  // ✅ useEffect para carregar username, profileImage e definir o status inicial de login
  // Este useEffect é executado uma vez na montagem do componente.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decodifica o token
        // Verifica se o token não expirou (opcional, mas boa prática)
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          // ✅ EXTRAI O NOME DE USUÁRIO DO TOKEN DECODIFICADO
          setUsername(decodedToken.username || ''); // Assumindo que 'username' está no payload
          // Se houver outras informações no token que você queira carregar, faça aqui
        } else {
          // Token expirado, limpa o localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          setIsLoggedIn(false);
          setUsername('');
        }
      } catch (error) {
        console.error("Erro ao decodificar token ou token inválido:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setUsername('');
      }
    } else {
      setIsLoggedIn(false);
      setUsername('');
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
  const handleLoginSuccess = useCallback((token) => { // ✅ Removido loggedInUsername como parâmetro
    localStorage.setItem('token', token); // Salva o token JWT no localStorage
    
    try {
      const decodedToken = jwtDecode(token); // Decodifica o token
      // ✅ EXTRAI O NOME DE USUÁRIO DO TOKEN DECODIFICADO
      const extractedUsername = decodedToken.username || ''; // Assumindo que 'username' está no payload
      localStorage.setItem('username', extractedUsername); // Salva o username no localStorage
      setUsername(extractedUsername); // Atualiza o estado 'username' no App.js
      setIsLoggedIn(true); // Atualiza o estado 'isLoggedIn' para true
    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
      // Em caso de erro na decodificação, trate como falha de login
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setIsLoggedIn(false);
      setUsername('');
    }
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
              // setUsername foi removido daqui, pois o username agora é extraído do token no App.js
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
                username={username} // Agora o username vem do estado centralizado do App.js
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
