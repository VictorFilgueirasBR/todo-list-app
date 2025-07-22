// src/pages/Profile.js
import React, { useState, useEffect, useMemo, useCallback } from "react"; // Adicione useCallback aqui!
import { FiMoreHorizontal } from "react-icons/fi";
import "./Profile.css";
import SettingsPopup from "../components/SettingsPopup";
import TaskListBox from "../components/TaskListBox";
import SavedTaskList from "../components/SavedTaskList"; 
import TaskListReview from "../components/TaskListReview";
import axios from "axios";
import headerGif from "../assets/header-img.png";
import savedTaskListCodeString from '../components/SavedTaskList.js?raw'; // Importa o conteúdo do arquivo como string
import ClassListOrder from '../components/ClassListOrder';

const Profile = () => {
  const [showPopup, setShowPopup] = useState(false);
  //const [popupSection, setPopupSection] = useState("main");
  const [profileImage, setProfileImage] = useState(null); // avatar
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [showListBox, setShowListBox] = useState(false);
  const [savedLists, setSavedLists] = useState([]); 
  const [selectedList, setSelectedList] = useState(null); 
  const [loadingLists, setLoadingLists] = useState(true); 
  const [errorLists, setErrorLists] = useState(null); 

  const token = localStorage.getItem("token");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Função para buscar o perfil do usuário
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsername(res.data.username);
        if (res.data.profileImage) {
          setProfileImage(`${API_URL}${res.data.profileImage}`);
        } else {
          setProfileImage(null);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    };

    if (token) fetchProfile();
  }, [token, API_URL]); 

  // ✅ Função para carregar as listas do backend
  const fetchTaskLists = useCallback(async () => {
    setLoadingLists(true);
    setErrorLists(null); 
    try {
      if (!token) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.");
      }

      const response = await axios.get(`${API_URL}/api/tasklists`, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSavedLists(response.data); 
    } catch (error) {
      console.error("Erro ao carregar listas de tarefas:", error);
      setErrorLists("Falha ao carregar as listas de tarefas. Tente novamente.");
    } finally {
      setLoadingLists(false);
    }
  }, [token, API_URL]);

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
      const res = await axios.put(
        `${API_URL}/api/tasklists/${updatedListFromChild._id}`, 
        updatedListFromChild,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSavedLists(prevLists => 
        prevLists.map((l) => (l._id === res.data.taskList._id ? res.data.taskList : l))
      );
      
      setSelectedList(res.data.taskList); 
      
      // Chamada para recarregar as listas é importante para a ordenação ser aplicada
      fetchTaskLists(); 

    } catch (err) {
      console.error("Erro ao atualizar lista:", err.response?.data || err);
    }
  }, [token, API_URL, fetchTaskLists]);

  const handleDeleteList = useCallback(async (listId) => {
    try {
      await axios.delete(`${API_URL}/api/tasklists/${listId}`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setSavedLists(prevLists => prevLists.filter((l) => l._id !== listId));
      
      setSelectedList(null); 
      
      fetchTaskLists(); 

    } catch (err) {
      console.error("Erro ao deletar lista:", err.response?.data || err);
    }
  }, [token, API_URL, fetchTaskLists]);

  // ✅ NOVA LÓGICA DE ORDENAÇÃO
  const sortedLists = useMemo(() => {
    // Cria uma cópia da array para não modificar o estado original diretamente
    const listsCopy = [...savedLists]; 

    return listsCopy.sort((a, b) => {
      const reminderA = a.reminder;
      const reminderB = b.reminder;

      const hasReminderA = reminderA && reminderA.date && reminderA.time;
      const hasReminderB = reminderB && reminderB.date && reminderB.time;

      let dateA, dateB;

      if (hasReminderA) {
        dateA = new Date(`${reminderA.date}T${reminderA.time}`); // Converte para objeto Date
      }
      if (hasReminderB) {
        dateB = new Date(`${reminderB.date}T${reminderB.time}`); // Converte para objeto Date
      }

      // 1. Prioriza listas com lembrete definido
      if (hasReminderA && !hasReminderB) {
        return -1; // 'a' (com lembrete) vem antes de 'b' (sem lembrete)
      }
      if (!hasReminderA && hasReminderB) {
        return 1;  // 'b' (com lembrete) vem antes de 'a' (sem lembrete)
      }

      // 2. Se ambos têm lembrete, ordena pelo prazo mais próximo
      if (hasReminderA && hasReminderB) {
        return dateA.getTime() - dateB.getTime(); // Ordena cronologicamente
      }

      // 3. Se nenhum tem lembrete (ou para desempate), ordena por data de criação (mais recente primeiro)
      // Presume que 'createdAt' existe e é uma string de data válida (ISO 8601)
      const createdAtA = new Date(a.createdAt);
      const createdAtB = new Date(b.createdAt);
      return createdAtB.getTime() - createdAtA.getTime(); // Mais recente primeiro
    });
  }, [savedLists]); // ✅ O useMemo só recalcula quando savedLists muda


  return (
    <div className="profile-page">
      {/* Seção do Perfil do Usuário */}
      <section className="profile-wrapper">
        <div className="profile-banner">
          <img src={headerGif} alt="Banner do perfil" />
        </div>

        <div className="profile-picture"
          onClick={() => {
            //setPopupSection("avatar");
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
            //setPopupSection("main");
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

        {/* ✅ Renderiza as listas ORDENADAS */}
        {!loadingLists && !errorLists && sortedLists.map((list) => ( // ✅ Usando sortedLists
          <SavedTaskList
            key={list._id}
            list={list}
            onOpen={() => setSelectedList(list)} 
            onDelete={() => handleDeleteList(list._id)} 
            code={savedTaskListCodeString} // <--- A LINHA QUE FOI ADICIONADA/ALTERADA AQUI!
          />
        ))}
      </section>

      {showPopup && (
        <SettingsPopup
          onClose={() => setShowPopup(false)}
          username={username}
          setUsername={setUsername}
          setProfileImage={setProfileImage}
        />
      )}

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