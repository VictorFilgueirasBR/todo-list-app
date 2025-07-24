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
      console.log("Profile.js useEffect: Iniciando fetchProfile...");
      try {
        const res = await api.get(`/auth/profile`);
        console.log("Profile.js useEffect: Resposta da API de perfil:", res.data);

        // Atualiza o username no estado global (App.js)
        if (res.data.username) {
          setUsername(res.data.username);
          localStorage.setItem('username', res.data.username);
          console.log("Profile.js useEffect: Username definido:", res.data.username);
        }

        // Atualiza a profileImage no estado global (App.js)
        // res.data.profileImage virá do backend como /uploads/avatars/nome_da_imagem.png
        if (res.data.profileImage) { 
          const fullImageUrl = `${api.defaults.baseURL}${res.data.profileImage}`;
          setProfileImage(fullImageUrl);
          localStorage.setItem('profileImage', fullImageUrl);
          console.log("Profile.js useEffect: Imagem de perfil definida:", fullImageUrl);
        } else {
          setProfileImage(null);
          localStorage.removeItem('profileImage');
          console.log("Profile.js useEffect: Nenhuma imagem de perfil retornada ou vazia.");
        }
      } catch (err) {
        console.error('Profile.js useEffect: Erro ao carregar perfil:', err);
        // Em caso de erro, limpa os dados para evitar exibir informações incorretas
        setUsername('');
        setProfileImage(null);
        localStorage.removeItem('username');
        localStorage.removeItem('profileImage');
      }
    };

    if (token) {
      console.log("Profile.js useEffect: Token presente, chamando fetchProfile.");
      fetchProfile();
    } else {
      console.log("Profile.js useEffect: Nenhum token, limpando dados do perfil.");
      setUsername('');
      setProfileImage(null);
      localStorage.removeItem('username');
      localStorage.removeItem('profileImage');
    }
  }, [token, setUsername, setProfileImage]); // Dependências: token, setUsername e setProfileImage

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
  }, [token]);

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

  // ✅ NOVO LOG: Loga o valor da prop profileImage antes da renderização
  console.log("Profile.js Render: profileImage prop atual:", profileImage);
  console.log("Profile.js Render: username prop atual:", username);

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
