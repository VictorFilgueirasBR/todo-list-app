// src/components/SettingsPopup.js
import React, { useState, useRef, useEffect } from "react";
// import axios from "axios"; // ❌ REMOVIDO: Não precisamos mais do axios direto
import api from "../services/api"; // ✅ ALTERADO: Importa a instância 'api'
import { FiX, FiUpload, FiUser, FiTrash } from "react-icons/fi";
import toast from 'react-hot-toast';
import "./SettingsPopup.css";

const SettingsPopup = ({ onClose, username, setUsername, setProfileImage, initialSection, setInitialSection }) => {
  const [activeSection, setActiveSection] = useState(initialSection || "main");
  const [newUsername, setNewUsername] = useState(username || '');

  const popupRef = useRef(null);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // ✅ useEffect para lidar com cliques fora do popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Se o clique não foi dentro do popup (o elemento com a ref)
      // E o clique não foi no botão de fechar (que já tem seu próprio onClick)
      // E o clique não foi no próprio overlay (que já está capturando o evento)
      // A condição principal é verificar se o clique *não* está contido em 'popupRef.current'
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose(); // Chama a função para fechar o popup
        if(setInitialSection) setInitialSection("main"); // Reseta a seção inicial
      }
    };

    // Adiciona o event listener ao 'popup-overlay' que é o elemento pai de tudo
    // Este overlay já tem a class 'popup-overlay' e cobre toda a tela.
    // Assim, o listener é adicionado ao elemento que é clicável fora do popup.
    const overlayElement = document.querySelector('.popup-overlay');
    if (overlayElement) {
        overlayElement.addEventListener("mousedown", handleClickOutside);
    }
    
    // Cleanup: remove o event listener quando o componente é desmontado
    return () => {
      if (overlayElement) {
        overlayElement.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [onClose, setInitialSection]); // Dependências: onClose e setInitialSection

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarDragActive, setAvatarDragActive] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef(null);

  // const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // ❌ REMOVIDO: Usaremos a instância 'api'

  const handleUsernameSave = async () => {
    try {
      // const token = localStorage.getItem("token"); // Token já é adicionado pelo interceptor
      // ✅ ALTERADO: Usando 'api.put' e URL relativa
      const res = await api.put(
        '/profile/username', // URL relativa, o prefixo /api é adicionado pela baseURL do axios
        { username: newUsername }
        // { headers: { Authorization: `Bearer ${token}` } } // Token já é adicionado pelo interceptor
      );
      if (res.status === 200) {
        setUsername(newUsername);
        localStorage.setItem('username', newUsername);
        toast.success("Nome de usuário atualizado com sucesso!");
        setActiveSection("main");
        if(setInitialSection) setInitialSection("main");
      }
    } catch (err) {
      console.error("Erro ao atualizar nome de usuário:", err.response ? err.response.data : err.message);
      toast.error(`Erro ao atualizar nome de usuário: ${err.response?.data?.message || err.response?.data?.error || err.message}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
      const previewURL = URL.createObjectURL(file);
      setAvatarPreview(previewURL);
      setAvatarSuccess(true);
    } else {
      toast.error("Formato inválido. Use PNG, JPG ou GIF.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAvatarDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e, inputRef) => {
    e.preventDefault();
    e.stopPropagation();
    setAvatarDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
        const previewURL = URL.createObjectURL(file);
        setAvatarPreview(previewURL);
        setAvatarSuccess(true);
        inputRef.current.files = e.dataTransfer.files;
      } else {
        toast.error("Formato inválido. Use PNG, JPG ou GIF.");
      }
    }
  };

  const handleRemove = () => {
    setAvatarPreview(null);
    setAvatarSuccess(false);
    avatarInputRef.current.value = null;
  };

  const handleConfirmSend = async () => {
    const file = avatarInputRef.current.files[0];
    if (!file) return toast.error("Nenhum arquivo selecionado.");

    const formData = new FormData();
    formData.append("image", file);

    try {
      setAvatarLoading(true);
      // const token = localStorage.getItem("token"); // Token já é adicionado pelo interceptor
      // ✅ ALTERAÇÃO CRUCIAL: Usando 'api.put' e URL relativa
      const res = await api.put('/profile/uploads/avatars', formData, { // <-- ENVIANDO INFORMAÇÕES DO AVATAR
        headers: {
          // Authorization: `Bearer ${token}`, // Token já é adicionado pelo interceptor
          "Content-Type": "multipart/form-data", // Essencial para envio de arquivos
        },
      });

      if (res.status === 200) {
        const imagePath = res.data.avatar; // O backend agora retorna 'avatar'
        if (imagePath) {
          // ✅ Corrigido para usar a baseURL configurada no api.js para a imagem
          // `api.defaults.baseURL` é 'https://todolistapp22.duckdns.org/api'
          // Precisamos remover o '/api' para obter a base 'https://todolistapp22.duckdns.org'
          setProfileImage(`${api.defaults.baseURL.replace('/api', '')}${imagePath}`); // Atualiza o estado da imagem de perfil no App.js
          toast.success("Avatar enviado com sucesso!");
          // Resetar estados e fechar/voltar para a seção principal
          setAvatarPreview(null);
          setAvatarSuccess(false);
          setActiveSection("main");
          if(setInitialSection) setInitialSection("main");
        }
      }
    } catch (err) {
      console.error("Erro ao enviar imagem:", err.response ? err.response.data : err.message);
      toast.error(`Erro ao enviar imagem: ${err.response?.data?.error || err.response?.data?.message || err.message}`);
    } finally {
      setAvatarLoading(false);
    }
  };

  const renderMainSettings = () => (
    <div className="popup-content">
      <h2>Configurações</h2>
      <div className="settings-options">
        <button onClick={() => setActiveSection("username")}>
          <FiUser /> Alterar Nome de Usuário
        </button>
        <button onClick={() => setActiveSection("avatar")}>
          <FiUpload /> Enviar Foto de Perfil
        </button>
      </div>
    </div>
  );

  const renderUsernameEdit = () => (
    <div className="popup-content">
      <h2>Alterar Nome de Usuário</h2>
      <input
        type="text"
        value={newUsername}
        onChange={(e) => setNewUsername(e.target.value)}
        className="username-input"
      />
      <div className="popup-buttons">
        <button className="cta-button" onClick={() => setActiveSection("main")}>
          Voltar
        </button>
        <button className="cta-button" onClick={handleUsernameSave}>
          Salvar
        </button>
      </div>
    </div>
  );

  const renderUploadSection = () => {
    const preview = avatarPreview;
    const dragActive = avatarDragActive;
    const success = avatarSuccess;
    const loading = avatarLoading;
    const inputRef = avatarInputRef;

    return (
      <div
        className={`popup-content upload-zone ${dragActive ? "dragging" : ""}`}
        onDragEnter={(e) => handleDrag(e)}
        onDragOver={(e) => handleDrag(e)}
        onDragLeave={(e) => handleDrag(e)}
        onDrop={(e) => handleDrop(e, inputRef)}
      >
        <h2>Alterar Foto de Perfil</h2>

        <div className="upload-preview" onClick={() => inputRef.current.click()}>
          {loading ? (
            <div className="loader"></div>
          ) : preview ? (
            <img src={preview} alt="Preview" />
          ) : (
            <>
              <div className="upload-icon-large">+</div>
              <p className="upload-hint">Faça o upload do seu arquivo JPG, PNG ou GIF</p>
            </>
          )}

          {preview && (
            <button className="remove-button" onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}>
              <FiTrash size={20} />
            </button>
          )}
        </div>

        <input
          type="file"
          accept="image/png, image/jpeg, image/gif"
          ref={inputRef}
          onChange={(e) => handleFileChange(e)}
          style={{ display: "none" }}
        />

        {success && <p className="upload-success">Clique abaixo para enviar.</p>}

        <div className="popup-buttons">
          <button className="cta-button" onClick={() => setActiveSection("main")}>
            Voltar
          </button>
          <button className="cta-button" onClick={handleConfirmSend} disabled={loading}>
            Enviar
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="popup-overlay" /* O overlay é clicável */>
      {/* ✅ Adicionado a ref ao div 'popup' */}
      <div className="popup" ref={popupRef}>
        <button className="close-button" onClick={() => {
          onClose();
          if(setInitialSection) setInitialSection("main");
        }}>
          <FiX />
        </button>
        {activeSection === "main"
          ? renderMainSettings()
          : activeSection === "username"
          ? renderUsernameEdit()
          : renderUploadSection()}
      </div>
    </div>
  );
};

export default SettingsPopup;
