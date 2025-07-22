// src/components/TaskListSection.js
import React, { useState } from "react";
import TaskListBox from "./TaskListBox";
import "./TaskListSection.css";

const TaskListSection = () => {
  const [showListBox, setShowListBox] = useState(false);

  return (
    <section className="task-list-section">
      {/* Quadro de criação visível ao clicar no botão */}
      {showListBox && (
        <TaskListBox onCancel={() => setShowListBox(false)} />
      )}

      {/* Botão flutuante no canto inferior direito */}
      <button
        className="fixed-new-list-button"
        onClick={() => setShowListBox(!showListBox)}
      >
        + Nova Lista
      </button>
    </section>
  );
};

export default TaskListSection;
