// src/components/SettingsPopup.js
import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
        if(setInitialSection) setInitialSection("main");
      }
    };

    const overlayElement = document.querySelector('.popup-overlay');
    if (overlayElement) {
        overlayElement.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      if (overlayElement) {
        overlayElement.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [onClose, setInitialSection]);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarDragActive, setAvatarDragActive] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef(null);

  const handleUsernameSave = async () => {
    try {
      const res = await api.put(
        '/profile/username',
        { username: newUsername }
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
      const res = await api.put('/profile/uploads/avatars', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        const imagePath = res.data.avatar; // Ex: /uploads/avatars/nome_da_imagem.jpg
        if (imagePath) {
          // ✅ CORREÇÃO AQUI: Adiciona o prefixo /api para que o Nginx encaminhe corretamente
          // api.defaults.baseURL já é 'https://todolistapp22.duckdns.org/api'
          setProfileImage(`${api.defaults.baseURL}${imagePath}`); // Resulta em: https://todolistapp22.duckdns.org/api/uploads/avatars/nome_da_imagem.jpg
          toast.success("Avatar enviado com sucesso!");
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
          onChange={handleFileChange}
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
    <div className="popup-overlay">
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
