// src/components/TaskListBox.js
import React, { useState, useRef } from "react";
import "./TaskListBox.css";
import { FiTrash, FiArrowLeftCircle } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast"; // ✅ Importe o toast

// Atualize a prop onSaveList para onSaveListSuccess (se ainda não fez)
const TaskListBox = ({ onCancel, onSaveListSuccess }) => {
  const [step, setStep] = useState("form");
  const [listTitle, setListTitle] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemLink, setItemLink] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const inputRef = useRef(null);
  // const [apiFeedback, setApiFeedback] = useState(""); // ✅ REMOVA ESTE ESTADO, pois usaremos toasts
  const [isSaving, setIsSaving] = useState(false);


  const maxChars = 150;
  const remainingChars = maxChars - listDescription.length;
  const itemRemainingChars = maxChars - itemDescription.length;

  const handleImageUpload = (file) => {
    if (file && ["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setPreviewImage(reader.result);
          setLoading(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Formato inválido. Use PNG, JPEG ou GIF."); // ✅ Toast de erro
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
  };

  const handleAddItemToList = () => {
    if (!itemTitle) {
      toast.warn("Dê um título ao item!"); // ✅ Toast de aviso
      return;
    }
    const newItem = {
      title: itemTitle,
      link: itemLink,
      description: itemDescription,
      image: previewImage,
    };
    setItems([...items, newItem]);
    setItemTitle("");
    setItemLink("");
    setItemDescription("");
    setPreviewImage(null);
    setStep("items");
  };

  const handleRemoveItem = (indexToRemove) => {
    const updatedItems = items.filter((_, i) => i !== indexToRemove);
    setItems(updatedItems);
    toast.info("Item removido da lista."); // ✅ Toast de informação
  };

  const handleEditItem = (index) => {
    const item = items[index];
    setItemTitle(item.title);
    setItemLink(item.link);
    setItemDescription(item.description || "");
    setPreviewImage(item.image);
    setEditingIndex(index);
    setStep("configItem");
  };

  const handleSaveEditedItem = () => {
    const updated = [...items];
    updated[editingIndex] = {
      title: itemTitle,
      link: itemLink,
      description: itemDescription,
      image: previewImage,
    };
    setItems(updated);
    setItemTitle("");
    setItemLink("");
    setItemDescription("");
    setPreviewImage(null);
    setEditingIndex(null);
    setStep("items");
    toast.success("Item atualizado com sucesso!"); // ✅ Toast de sucesso
  };

  const handleSaveListToBackend = async () => {
    if (!listTitle) {
      toast.warn("O título da lista não pode ser vazio."); // ✅ Toast de aviso
      return;
    }
    if (items.length === 0) {
      toast.warn("Adicione pelo menos um item à lista."); // ✅ Toast de aviso
      return;
    }

    setIsSaving(true);
    // setApiFeedback(""); // ✅ REMOVA ESTA LINHA

    const newListData = {
      title: listTitle,
      description: listDescription,
      items: items,
    };

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error("Você precisa estar logado para salvar a lista."); // ✅ Toast de erro
      setIsSaving(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/tasklists",
        newListData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log("Lista salva com sucesso:", response.data);
      toast.success("Lista de tarefas criada com sucesso!"); // ✅ Toast de sucesso
      
      if (onSaveListSuccess) {
        onSaveListSuccess(response.data.taskList); 
      }
      onCancel(); // Fecha o modal

    } catch (error) {
      console.error("Erro ao salvar lista:", error.response ? error.response.data : error.message);
      const errorMessage = error.response && error.response.data && error.response.data.message 
                           ? error.response.data.message 
                           : 'Erro ao salvar a lista. Tente novamente.';
      toast.error(`Erro: ${errorMessage}`); // ✅ Toast de erro
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="tasklist-overlay">
      <div className="list-box">
        {/* Step: Criar lista */}
        {step === "form" && (
          <>
            <input
              type="text"
              placeholder="Título"
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              className="list-title-input"
            />
            <div className="description-wrapper">
              <textarea
                placeholder="Descrição..."
                value={listDescription}
                onChange={(e) => setListDescription(e.target.value)}
                className="list-description-input"
                maxLength={maxChars}
              />
              <div className={`char-count ${remainingChars <= 10 ? "danger" : remainingChars <= 50 ? "warning" : ""}`}>
                {remainingChars}
              </div>
            </div>
            <div className="list-buttons">
              <button className="task-action-button" onClick={() => setStep("items")}>Criar</button>
              <button className="task-action-button" onClick={onCancel}>Cancelar</button>
            </div>
          </>
        )}

        {/* Step: Lista de Itens */}
        {step === "items" && (
          <>
            <div className="tasklist-header">
              <h2 className="listtitle-step-additem">{listTitle}</h2>
              <span className="icon-btn" onClick={() => setStep("form")}>
                <FiArrowLeftCircle size={20} />
              </span>
            </div>
            {items.map((item, index) => (
              <div key={index} className="review-item-box" onClick={() => handleEditItem(index)}>
                <span className="review-item-title">{item.title}</span>
                <span className="review-trash-icon" onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(index);
                }}>
                  <FiTrash size={18} />
                </span>
              </div>
            ))}
            <div className="list-buttons">
              <button
                className={`task-action-button ${items.length === 0 ? 'full-width' : ''}`}
                onClick={() => setStep("addItem")}
              >
                + Novo Item
              </button>
              {items.length > 0 && (
                <button
                  className="task-action-button"
                  onClick={handleSaveListToBackend}
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              )}
            </div>
            {/* ✅ REMOVA a linha abaixo, o apiFeedback não é mais usado */}
            {/* {apiFeedback && (
              <p className={`api-feedback ${apiFeedback.startsWith("Erro") ? "error" : "success"}`}>
                {apiFeedback}
              </p>
            )} */}
          </>
        )}

        {/* Step: Adicionar Novo Item */}
        {step === "addItem" && (
          <>
            <div className="tasklist-header">
              <h2>Novo Item</h2>
              <span className="icon-btn" onClick={() => setStep("items")}>
                <FiArrowLeftCircle size={20} />
              </span>
            </div>

            <input
              type="text"
              placeholder="Título do Item..."
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              className="list-title-input"
            />
            <input
              type="text"
              placeholder="Link..."
              value={itemLink}
              onChange={(e) => setItemLink(e.target.value)}
              className="list-title-input"
            />

            <div className="description-wrapper">
              <textarea
                placeholder="Descrição do item..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="list-description-input"
                maxLength={maxChars}
              />
              <div className={`char-count ${itemRemainingChars <= 10 ? "danger" : itemRemainingChars <= 50 ? "warning" : ""}`}>
                {itemRemainingChars}
              </div>
            </div>

            <div className={`upload-preview ${loading ? "loading" : ""}`} onClick={() => inputRef.current.click()}>
              {loading ? (
                <div className="loader"></div>
              ) : previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="upload-preview-image" />
                  <button className="remove-button" onClick={handleRemoveImage}>
                    <FiTrash size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="upload-icon-large">+</div>
                  <p className="upload-hint">Faça o upload do seu arquivo JPG, PNG ou GIF</p>
                </>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif"
                ref={inputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="list-buttons">
              <button className="task-action-button full-width" onClick={handleAddItemToList}>
                Adicionar
              </button>
            </div>
          </>
        )}

        {/* Step: Editar Item */}
        {step === "configItem" && (
          <>
            <div className="tasklist-header">
              <h2>Editar Item</h2>
              <span className="icon-btn" onClick={() => setStep("items")}>
                <FiArrowLeftCircle size={20} />
              </span>
            </div>

            <input
              type="text"
              placeholder="Título do Item..."
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              className="list-title-input"
            />
            <input
              type="text"
              placeholder="Link..."
              value={itemLink}
              onChange={(e) => setItemLink(e.target.value)}
              className="list-title-input"
            />

            <div className="description-wrapper">
              <textarea
                placeholder="Descrição do item..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="list-description-input"
                maxLength={maxChars}
              />
              <div className={`char-count ${itemRemainingChars <= 10 ? "danger" : itemRemainingChars <= 50 ? "warning" : ""}`}>
                {itemRemainingChars}
              </div>
            </div>

            <div className={`upload-preview ${loading ? "loading" : ""}`} onClick={() => inputRef.current.click()}>
              {loading ? (
                <div className="loader"></div>
              ) : previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="upload-preview-image" />
                  <button className="remove-button" onClick={handleRemoveImage}>
                    <FiTrash size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="upload-icon-large">+</div>
                  <p className="upload-hint">Faça o upload do seu arquivo JPG, PNG ou GIF</p>
                </>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg, image/gif"
                ref={inputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            <div className="list-buttons">
              <button className="task-action-button" onClick={() => setStep("items")}>
                Cancelar
              </button>
              <button className="task-action-button" onClick={handleSaveEditedItem}>
                Salvar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskListBox;