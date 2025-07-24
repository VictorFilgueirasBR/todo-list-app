// frontend/src/components/TaskListReview.js
import React, { useState, useEffect } from "react";
import "./TaskListReview.css";
import { FiCheckCircle, FiCircle, FiArrowLeftCircle } from "react-icons/fi";
import { BiBell } from "react-icons/bi";
import toast from "react-hot-toast";
import api from "../services/api"; // Importa a instância 'api'

const TaskListReview = ({ list, onClose, onUpdateList, onDeleteList }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemConfirm, setShowItemConfirm] = useState(false);
  const [showListConfirm, setShowListConfirm] = useState(false);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  // ❌ REMOVIDO: A variável 'token' não é mais necessária aqui
  // pois o token é adicionado automaticamente pelo interceptor do Axios na instância 'api'.
  // const token = localStorage.getItem("token"); 
  

  useEffect(() => {
    // Carrega o lembrete existente ao abrir a lista
    if (list?.reminder?.date && list?.reminder?.time) {
      setReminderDate(list.reminder.date);
      setReminderTime(list.reminder.time);
    } else {
      setReminderDate("");
      setReminderTime("");
    }
  }, [list]); 

  // A validação condicional foi movida para DEPOIS dos Hooks
  // Isso garante que todos os Hooks sejam chamados na mesma ordem, em todas as renderizações.
  if (!list || !list._id) {
    console.error("TaskListReview received null or undefined list prop, or list is missing _id.");
    return null; 
  }

  // Use list._id diretamente para as operações
  const currentListId = list._id;

  // Função para obter a URL completa da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Usa api.defaults.baseURL para construir a URL da imagem
    // Adiciona /uploads/avatars/ pois o backend retorna apenas o nome do arquivo
    return `${api.defaults.baseURL}/uploads/avatars/${imagePath}`;
  };

  // Função para marcar/desmarcar item como concluído
  const handleToggleItemCompletion = async () => {
    if (!selectedItem) return;

    const updatedItems = list.items.map((i) =>
      i._id === selectedItem._id ? { ...i, completed: !i.completed } : i
    );
    
    const updatedListPayload = { ...list, items: updatedItems };

    try {
      // Usa a instância 'api' para a requisição PUT
      const response = await api.put( // Substitui axios.put por api.put
        `/tasklists/${currentListId}`, // Remove ${API_URL}
        updatedListPayload,
        // Headers de autorização e content-type já são adicionados pelo interceptor do 'api'
        // Não é necessário passar o objeto de headers aqui.
      );
      
      onUpdateList(response.data.taskList);
      setSelectedItem(response.data.taskList.items.find(item => item._id === selectedItem._id)); 
      
      toast.success(
        response.data.taskList.items.find(item => item._id === selectedItem._id).completed 
        ? "✅ Item marcado como concluído!" 
        : "↩️ Item marcado como pendente!"
      );
      setShowItemConfirm(false);
    } catch (error) {
      console.error("Erro ao atualizar status do item:", error.response?.data || error);
      toast.error("❌ Erro ao atualizar item. Tente novamente.");
    }
  };

  // Função para salvar o lembrete
  const handleSaveReminder = async () => {
    if (!reminderDate || !reminderTime) {
      toast.error("Por favor, selecione a data e a hora para o lembrete.");
      return;
    }

    const updatedListPayload = {
      ...list,
      reminder: {
        date: reminderDate,
        time: reminderTime,
      },
    };

    try {
      // Usa a instância 'api' para a requisição PUT
      const response = await api.put( // Substitui axios.put por api.put
        `/tasklists/${currentListId}`, // Remove ${API_URL}
        updatedListPayload,
        // Headers de autorização e content-type já são adicionados pelo interceptor do 'api'
        // Não é necessário passar o objeto de headers aqui.
      );

      onUpdateList(response.data.taskList);
      toast.success(" Lembrete salvo com sucesso!");
      setShowNotifyPopup(false);
    } catch (error) {
      console.error("Erro ao salvar lembrete:", error.response?.data || error);
      toast.error("❌ Erro ao salvar lembrete. Tente novamente.");
    }
  };

  // Função para deletar a lista inteira
  const handleConfirmListDeletion = async () => {
    try {
      // Usa a instância 'api' para a requisição DELETE
      await api.delete(`/tasklists/${currentListId}`); // Substitui axios.delete e remove ${API_URL}
      // Headers de autorização já são adicionados pelo interceptor do 'api'
      // Não é necessário passar o objeto de headers aqui.
      onDeleteList(currentListId);
      toast.success("🗑️ Lista excluída com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao deletar lista:", error.response?.data || error);
      toast.error("❌ Erro ao deletar lista. Tente novamente.");
    }
  };

  return (
    <div className="tasklistreview-overlay">
      <div className="tasklistreview-box">
        <div className="tasklistreview-header">
          <h2 className="tasklistreview-title">{selectedItem ? selectedItem.title : list.title}</h2>
          <button className="back-button" onClick={selectedItem ? () => setSelectedItem(null) : onClose}>
            {selectedItem ? <FiArrowLeftCircle className="back-icon" /> : "X"}
          </button>
        </div>

        {!selectedItem ? (
          <>
            <p className="tasklistreview-description">{list.description}</p>
            <div className="tasklistreview-items">
              {list.items?.length > 0 ? (
                list.items.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`tasklistreview-item ${item.completed ? 'completed-item' : ''}`}
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.title}
                    {item.completed ? 
                      <FiCheckCircle className="item-completed-icon" size={18} /> : 
                      <FiCircle className="item-completed-icon" size={18} color="#ccc" />
                    }
                  </div>
                ))
              ) : (
                <p className="no-items-text">Nenhum item adicionado.</p>
              )}
            </div>

            <section className="divider-section-item">
              <hr className="divider-line-up" />
              <span className="divider-text-program">AGENDADO PARA</span>
              <hr className="divider-line-down" />
            </section>

            {list.reminder?.date && list.reminder?.time ? (
              <div className="reminder-box">
                <p><strong>Data: {list.reminder.date}</strong></p>
                <p><strong>Hora: {list.reminder.time}</strong></p>
                <button 
                  className="timerprogram-button edit-reminder-button" 
                  onClick={() => setShowNotifyPopup(true)}
                >
                  Editar Lembrete <BiBell className="alarm-icon" />
                </button>
              </div>
            ) : (
              <div className="timer-button">
                <button
                  className="timerprogram-button"
                  onClick={() => setShowNotifyPopup(true)}
                >
                  Adicionar lembrete <BiBell className="alarm-icon" />
                </button>
              </div>
            )}
            
            <button
              className="delete-list-button"
              onClick={() => setShowListConfirm(true)}
            >
              Excluir Lista
            </button>

          </>
        ) : (
          <div className="tasklistreview-item-details">
            <section className="divider-section-item">
              <hr className="divider-line" />
            </section>

            {selectedItem.link && (
              <p>
                <strong>Link:</strong>{" "}
                <a
                  href={selectedItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tasklistreview-link"
                >
                  {selectedItem.link}
                </a>
              </p>
            )}

            {selectedItem.description && (
              <p className="tasklistreview-item-description">
                <strong className="nomenclature-item-description">Descrição:</strong> {selectedItem.description}
              </p>
            )}

            <section className="divider-section-item">
              <hr className="divider-line" />
            </section>

            {selectedItem.image && (
              <div className="tasklistreview-image-wrapper">
                <img 
                  src={getImageUrl(selectedItem.image)} 
                  alt="Preview" 
                  className="tasklistreview-image" 
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/200x150?text=Imagem+Erro';
                    console.warn('Erro ao carregar imagem em TaskListReview:', getImageUrl(selectedItem.image));
                  }}
                />
              </div>
            )}

            <button
              className={`conclude-item-button ${selectedItem.completed ? 'reopen-item-button' : ''}`}
              onClick={() => setShowItemConfirm(true)}
            >
              {selectedItem.completed ? "Reabrir Item" : "Concluir Item"}
            </button>
          </div>
        )}

        {showItemConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <h2>Deseja realmente {selectedItem.completed ? "reabrir" : "concluir"} este item?</h2>
              <div className="confirm-buttons">
                <button className="confirm-button" onClick={handleToggleItemCompletion}>
                  {selectedItem.completed ? "Reabrir" : "Concluir"}
                </button>
                <button className="cancel-button" onClick={() => setShowItemConfirm(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {showListConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <h2>Deseja realmente excluir esta lista?</h2>
              <div className="confirm-buttons">
                <button
                  className="confirm-button"
                  onClick={handleConfirmListDeletion}
                >
                  Excluir
                </button>
                <button
                  className="cancel-button"
                  onClick={() => setShowListConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showNotifyPopup && (
          <div className="confirm-overlay">
            <div className="confirm-box popup-notify-box">
              <h2>Programar lembrete</h2>

              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="popup-input"
              />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="popup-input"
              />

              <div className="confirm-buttons">
                <button
                  className="confirm-button"
                  onClick={handleSaveReminder}
                >
                  Salvar
                </button>

                <button
                  className="cancel-button"
                  onClick={() => setShowNotifyPopup(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListReview;
