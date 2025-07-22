// src/components/SavedTaskList.js
import React, { useState, useEffect } from "react";
import "./SavedTaskList.css";
import { FiCircle, FiCheckCircle } from "react-icons/fi";
import { DiAtom } from "react-icons/di"; // Ícone DiAtom para abrir o popup
import CustomizeListPopup from "./CustomizeListPopup"; // Importa o popup
import savedTaskListRawCode from "../utils/savedTaskListCode"; // Importa a string de código

// ✅ ALTERAÇÃO AQUI: Adicione 'code' às props que SavedTaskList recebe
const SavedTaskList = ({ list, onOpen, onDelete }) => { 
  const [completed, setCompleted] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [urgencyClass, setUrgencyClass] = useState("");
  const [showCustomizePopup, setShowCustomizePopup] = useState(false); // Estado para o popup

  useEffect(() => {
    const reminderDate = list?.reminderDate || list?.reminder?.date;
    const reminderTime = list?.reminderTime || list?.reminder?.time;

    if (!reminderDate || !reminderTime) {
      setUrgencyClass("");
      return;
    }

    const deadline = new Date(`${reminderDate}T${reminderTime}`);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime(); // Calcula a diferença em milissegundos

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours <= 6) {
      setUrgencyClass("urgent-red");
    } else if (diffHours <= 36) {
      setUrgencyClass("urgent-orange");
    } else if (diffDays <= 5) { // Usando 5 dias como limite para 'green'
      setUrgencyClass("urgent-green");
    } else {
      setUrgencyClass("");
    }
  }, [list]);

  const handleConfirm = () => {
    setCompleted(true);
    if (typeof onDelete === "function") {
      onDelete(list._id);
    }
    setShowConfirmPopup(false);
  };

  // ✅ Função para abrir o popup de código
  const handleOpenCodePopup = (e) => {
    e.stopPropagation(); // Impede o clique no card de abrir a revisão da lista
    setShowCustomizePopup(true);
  };

  if (!list) return null;

  return (
    <>
      <div
        className={`saved-task-list ${urgencyClass}`}
        onClick={() => onOpen(list)}
      >
        <div className="list-actions-left">
          <div
            className="check-icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmPopup(true);
            }}
            title="Concluir Lista"
          >
            {completed ? <FiCheckCircle /> : <FiCircle />}
          </div>
        </div>

        <h3 className="saved-task-title" onClick={() => onOpen(list)}>
          {list.title}
        </h3>

        <p className="saved-task-description" onClick={() => onOpen(list)}>
          {list.description.length > 60
            ? `${list.description.slice(0, 60)}...`
            : list.description}
        </p>

        <div className="saved-items">
          {Array.isArray(list.items) && list.items.length > 0 ? (
            list.items.map((item, index) => (
              <div
                key={index}
                className="saved-task-item"
                onClick={() => onOpen(list)}
              >
                {item.title}
                {item.completed && (
                  <FiCheckCircle
                    size={18}
                    color="#00bfff"
                    style={{ marginLeft: "10px" }}
                  />
                )}
              </div>
            ))
          ) : (
            <p>Nenhum item.</p>
          )}
        </div>

        {/* ✅ DiAtom agora abre o popup para exibir o código */}
        <div className="list-bottom-actions">
          <DiAtom
            size={20}
            className="action-customize-icon"
            onClick={handleOpenCodePopup} // Chama a nova função
            title="Ver Código" // Novo tooltip
          />
        </div>

      </div>

      {showConfirmPopup && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h2>Deseja mesmo concluir essa lista?</h2>
            <div className="confirm-buttons">
              <button className="confirm-button" onClick={handleConfirm}>
                Concluir
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Renderização do CustomizeListPopup para exibir o código */}
      {showCustomizePopup && (
        <CustomizeListPopup
          onClose={() => setShowCustomizePopup(false)}
          code={savedTaskListRawCode} // Agora passamos a string de código!
        />
      )}
    </>
  );
};

export default SavedTaskList;