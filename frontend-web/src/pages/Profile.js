// src/pages/Profile.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import "./Profile.css";
// import SettingsPopup from "../components/SettingsPopup"; // ✅ Removido, SettingsPopup agora é renderizado no App.js
import TaskListBox from "../components/TaskListBox";
import SavedTaskList from "../components/SavedTaskList"; 
import TaskListReview from "../components/TaskListReview";
import api from "../services/api"; // ✅ ALTERADO: Importa a instância 'api'
// import axios from "axios"; // ❌ REMOVIDO: Não precisamos mais do axios direto
import headerGif from "../assets/header-img.png";
import savedTaskListCodeString from '../components/SavedTaskList.js?raw';
import ClassListOrder from '../components/ClassListOrder';

// ✅ Componente Profile agora recebe props do App.js
const Profile = ({ 
  username, 
  setUsername, 
  profileImage, 
  setProfileImage, 
  showPopup, // Usar prop do App.js
  setShowPopup, // Usar prop do App.js
  popupSection, // Usar prop do App.js
  setPopupSection // Usar prop do App.js
}) => {
  // const [showPopup, setShowPopup] = useState(false); // ❌ REMOVIDO: Vem via props
  // const [popupSection, setPopupSection] = useState("main"); // ❌ REMOVIDO: Vem via props
  // const [profileImage, setProfileImage] = useState(null); // ❌ REMOVIDO: Vem via props
  // const [username, setUsername] = useState(localStorage.getItem('username') || ''); // ❌ REMOVIDO: Vem via props

  const [showListBox, setShowListBox] = useState(false);
  const [savedLists, setSavedLists] = useState([]); 
  const [selectedList, setSelectedList] = useState(null); 
  const [loadingLists, setLoadingLists] = useState(true); 
  const [errorLists, setErrorLists] = useState(null); 

  const token = localStorage.getItem("token");

  // const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // ❌ REMOVIDO: Usaremos a instância 'api'

  // Função para buscar o perfil do usuário
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // ✅ ALTERADO: Usando 'api.get' e URL relativa
        const res = await api.get(`/auth/profile`); // O token já é adicionado pelo interceptor em api.js

        // setUsername(res.data.username); // ❌ REMOVIDO: Username já é gerenciado no App.js via JWT
        if (res.data.profileImage) {
          // ✅ Corrigido para usar a baseURL configurada no api.js para a imagem
          // Se o backend retorna um caminho relativo como '/uploads/...'
          // precisamos prefixar com a baseURL.
          // Assumindo que o `api` já tem a baseURL correta,
          // `api.defaults.baseURL` é a forma de acessá-la.
          setProfileImage(`${api.defaults.baseURL.replace('/api', '')}${res.data.profileImage}`);
        } else {
          setProfileImage(null);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        // Opcional: toast.error('Erro ao carregar dados do perfil.');
      }
    };

    if (token) fetchProfile();
  }, [token, setProfileImage]); // Dependências ajustadas

  // ✅ Função para carregar as listas do backend
  const fetchTaskLists = useCallback(async () => {
    setLoadingLists(true);
    setErrorLists(null); 
    try {
      if (!token) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.");
      }

      // ✅ ALTERADO: Usando 'api.get' e URL relativa
      const response = await api.get('/tasklists'); // O token já é adicionado pelo interceptor em api.js
      setSavedLists(response.data); 
    } catch (error) {
      console.error("Erro ao carregar listas de tarefas:", error);
      setErrorLists("Falha ao carregar as listas de tarefas. Tente novamente.");
    } finally {
      setLoadingLists(false);
    }
  }, [token]); // Dependências ajustadas, API_URL não é mais necessária

  // ✅ NOVO useEffect para carregar as listas quando o componente montar ou token mudar
  useEffect(() => {
    if (token) {
      fetchTaskLists();
    }
  }, [token, fetchTaskLists]); 

  // Função para ser chamada quando uma lista é salva com sucesso no TaskListBox
  const handleTaskListSavedSuccess = () => { 
    setShowListBox(false); 
    fetchTaskLists(); // Recarrega as listas após o salvamento
  };

  // Funções de manipulação de listas
  const handleUpdateList = useCallback(async (updatedListFromChild) => {
    try {
      // ✅ ALTERADO: Usando 'api.put' e URL relativa
      const res = await api.put(
        `/tasklists/${updatedListFromChild._id}`, 
        updatedListFromChild
      ); // O token já é adicionado pelo interceptor

      setSavedLists(prevLists => 
        prevLists.map((l) => (l._id === res.data.taskList._id ? res.data.taskList : l))
      );
      
      setSelectedList(res.data.taskList); 
      
      fetchTaskLists(); 

    } catch (err) {
      console.error("Erro ao atualizar lista:", err.response?.data || err);
    }
  }, [fetchTaskLists]); // Dependências ajustadas

  const handleDeleteList = useCallback(async (listId) => {
    try {
      // ✅ ALTERADO: Usando 'api.delete' e URL relativa
      await api.delete(`/tasklists/${listId}`); // O token já é adicionado pelo interceptor
      
      setSavedLists(prevLists => prevLists.filter((l) => l._id !== listId));
      
      setSelectedList(null); 
      
      fetchTaskLists(); 

    } catch (err) {
      console.error("Erro ao deletar lista:", err.response?.data || err);
    }
  }, [fetchTaskLists]); // Dependências ajustadas

  // ✅ NOVA LÓGICA DE ORDENAÇÃO (mantida inalterada, já estava correta)
  const sortedLists = useMemo(() => {
    const listsCopy = [...savedLists]; 

    return listsCopy.sort((a, b) => {
      const reminderA = a.reminder;
      const reminderB = b.reminder;

      const hasReminderA = reminderA && reminderA.date && reminderA.time;
      const hasReminderB = reminderB && reminderB.date && reminderB.time;

      let dateA, dateB;

      if (hasReminderA) {
        dateA = new Date(`${reminderA.date}T${reminderA.time}`);
      }
      if (hasReminderB) {
        dateB = new Date(`${reminderB.date}T${reminderB.time}`);
      }

      if (hasReminderA && !hasReminderB) {
        return -1;
      }
      if (!hasReminderA && hasReminderB) {
        return 1;
      }

      if (hasReminderA && hasReminderB) {
        return dateA.getTime() - dateB.getTime();
      }

      const createdAtA = new Date(a.createdAt);
      const createdAtB = new Date(b.createdAt);
      return createdAtB.getTime() - createdAtA.getTime();
    });
  }, [savedLists]);

  return (
    <div className="profile-page">
      {/* Seção do Perfil do Usuário */}
      <section className="profile-wrapper">
        <div className="profile-banner">
          <img src={headerGif} alt="Banner do perfil" />
        </div>

        <div className="profile-picture"
          onClick={() => {
            setPopupSection("avatar"); // ✅ Usando a prop setPopupSection
            setShowPopup(true); // ✅ Usando a prop setShowPopup
          }}
          style={{ cursor: "pointer" }}
        >
          {profileImage ? (
            <img src={profileImage} alt="Foto de perfil" />
          ) : (
            <div className="upload-placeholder">+</div>
          )}
        </div>

        <div className="profile-username">{username}</div> {/* ✅ Usando username da prop */}

        <div
          className="upload-icon"
          onClick={() => {
            setPopupSection("main"); // ✅ Usando a prop setPopupSection
            setShowPopup(true); // ✅ Usando a prop setShowPopup
          }}
        >
          <FiMoreHorizontal size={24} color="#fff" />
        </div>
      </section>

      <section className="divider-section">
        <hr className="divider-line" />
        <span className="divider-text">TO DO LIST</span>
        <hr className="divider-line" />
      </section>

      <section className="new-list-section">
        {showListBox && (
          <TaskListBox
            onCancel={() => setShowListBox(false)}
            onSaveListSuccess={handleTaskListSavedSuccess} 
          />
        )}
        <button
          className="floating-new-list-button"
          onClick={() => setShowListBox(!showListBox)}
        >
          + Novo
        </button>
      </section>

      <section className="saved-lists-section">
        {loadingLists && <p className="loading-message">Carregando listas...</p>}
        {errorLists && <p className="error-message">{errorLists}</p>}

        {!loadingLists && !errorLists && savedLists.length === 0 && (
          <p className="no-lists-text">Adicione suas listas aqui.</p>
        )}

        {/* ✅ Renderiza as listas ORDENADAS */}
        {!loadingLists && !errorLists && sortedLists.map((list) => (
          <SavedTaskList
            key={list._id}
            list={list}
            onOpen={() => setSelectedList(list)} 
            onDelete={() => handleDeleteList(list._id)} 
            code={savedTaskListCodeString}
          />
        ))}
      </section>

      {/* ❌ REMOVIDO: SettingsPopup agora é renderizado no App.js e não mais aqui
      {showPopup && (
        <SettingsPopup
          onClose={() => setShowPopup(false)}
          username={username}
          setUsername={setUsername}
          setProfileImage={setProfileImage}
        />
      )} */}

      {selectedList && ( 
        <TaskListReview
          list={selectedList}
          onClose={() => setSelectedList(null)} 
          onUpdateList={handleUpdateList} 
          onDeleteList={() => handleDeleteList(selectedList._id)} 
        />
      )}

      <ClassListOrder />

      <footer className="footer">
        <p>
          © 2025 TO DO LIST App. Todos os direitos reservados.{" "}
          <a
            href="https://github.com/VictorFilgueirasBR/"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Profile;
