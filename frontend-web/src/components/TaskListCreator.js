import React, { useState } from "react";
import "./TaskListCreator.css";

const TaskListCreator = ({ onClose, onAddItem }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const maxLength = 150;

  return (
    <div className="task-creator-box">
      <input
        type="text"
        placeholder="Título da Lista"
        className="list-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="description-container">
        <textarea
          placeholder="Descrição da Lista (máx 150 caracteres)"
          className="list-description-input"
          value={description}
          maxLength={maxLength}
          onChange={(e) => setDescription(e.target.value)}
        />
        <span className="char-count">{maxLength - description.length} restantes</span>
      </div>

      <div className="task-creator-buttons">
        <button className="cta-button" onClick={onAddItem}>Novo Item</button>
        <button className="cta-button cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default TaskListCreator;
