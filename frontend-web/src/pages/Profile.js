// src/pages/Profile.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import "./Profile.css";
import TaskListBox from "../components/TaskListBox";
import SavedTaskList from "../components/SavedTaskList"; 
import TaskListReview from "../components/TaskListReview";
import api from "../services/api";
import headerGif from "../assets/header-img.png";
import savedTaskListCodeString from '../components/SavedTaskList.js?raw';
import ClassListOrder from '../components/ClassListOrder';

const Profile = ({ 
  username, 
  setUsername, 
  profileImage, 
  setProfileImage, 
  showPopup, 
  setShowPopup, 
  popupSection, 
  setPopupSection 
}) => {
  const [showListBox, setShowListBox] = useState(false);
  const [savedLists, setSavedLists] = useState([]); 
  const [selectedList, setSelectedList] = useState(null); 
  const [loadingLists, setLoadingLists] = useState(true); 
  const [errorLists, setErrorLists] = useState(null); 

  const token = localStorage.getItem("token");

  // Função para buscar o perfil do usuário
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/auth/profile`);

        if (res.data.profileImage) { // res.data.profileImage é '/uploads/avatars/nome_da_imagem.jpg' do backend
          // ✅ CORREÇÃO AQUI: Garante que a URL da imagem sempre comece com /api/
          // Isso é crucial para o Nginx encaminhar corretamente.
          // api.defaults.baseURL já é 'https://todolistapp22.duckdns.org/api'
          // res.data.profileImage é '/uploads/avatars/nome_da_imagem.jpg'
          // A junção deve ser feita com cuidado para não duplicar barras ou prefixos.
          // Se res.data.profileImage já vem com uma barra inicial, basta concatenar.
          // Ex: https://todolistapp22.duckdns.org/api + /uploads/avatars/nome.jpg
          setProfileImage(`${api.defaults.baseURL}${res.data.profileImage}`);
        } else {
          setProfileImage(null);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        // Opcional: setProfileImage(null); para garantir que a imagem não apareça se houver erro
      }
    };

    if (token) fetchProfile();
  }, [token, setProfileImage]); // Dependências: token e setProfileImage

  const fetchTaskLists = useCallback(async () => {
    setLoadingLists(true);
    setErrorLists(null); 
    try {
      if (!token) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.");
      }

      const response = await api.get('/tasklists');
      setSavedLists(response.data); 
    } catch (error) {
      console.error("Erro ao carregar listas de tarefas:", error);
      setErrorLists("Falha ao carregar as listas de tarefas. Tente novamente.");
    } finally {
      setLoadingLists(false);
    }
  }, [token]); // Dependências: token

  useEffect(() => {
    if (token) {
      fetchTaskLists();
    }
  }, [token, fetchTaskLists]); 

  const handleTaskListSavedSuccess = () => { 
    setShowListBox(false); 
    fetchTaskLists();
  };

  const handleUpdateList = useCallback(async (updatedListFromChild) => {
    try {
      const res = await api.put(
        `/tasklists/${updatedListFromChild._id}`, 
        updatedListFromChild
      );
      
      setSavedLists(prevLists => 
        prevLists.map((l) => (l._id === res.data.taskList._id ? res.data.taskList : l))
      );
      
      setSelectedList(res.data.taskList); 
      
      fetchTaskLists(); 

    } catch (err) {
      console.error("Erro ao atualizar lista:", err.response?.data || err);
    }
  }, [fetchTaskLists]);

  const handleDeleteList = useCallback(async (listId) => {
    try {
      await api.delete(`/tasklists/${listId}`);
      
      setSavedLists(prevLists => prevLists.filter((l) => l._id !== listId));
      
      setSelectedList(null); 
      
      fetchTaskLists(); 

    } catch (err) {
      console.error("Erro ao deletar lista:", err.response?.data || err);
    }
  }, [fetchTaskLists]);

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
      <section className="profile-wrapper">
        <div className="profile-banner">
          <img src={headerGif} alt="Banner do perfil" />
        </div>

        <div className="profile-picture"
          onClick={() => {
            setPopupSection("avatar");
            setShowPopup(true);
          }}
          style={{ cursor: "pointer" }}
        >
          {profileImage ? (
            <img src={profileImage} alt="Foto de perfil" />
          ) : (
            <div className="upload-placeholder">+</div>
          )}
        </div>

        <div className="profile-username">{username}</div>

        <div
          className="upload-icon"
          onClick={() => {
            setPopupSection("main");
            setShowPopup(true);
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
