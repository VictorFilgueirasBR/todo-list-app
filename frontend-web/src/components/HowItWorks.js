import React from "react";
import "./HowItWorks.css";
import { FaUserPlus, FaClipboardList, FaBell, FaCheckCircle, FaCloud } from "react-icons/fa";

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <h2>Como funciona?</h2>
      <div className="steps-container">
        <div className="step">
          <FaUserPlus className="step-icon" />
          <h3>Crie sua conta</h3>
          <p>Cadastre-se em segundos e comece a usar a aplicação gratuitamente.</p>
        </div>
        <div className="step">
          <FaClipboardList className="step-icon" />
          <h3>Adicione tarefas</h3>
          <p>Organize seus compromissos e metas com praticidade.</p>
        </div>
        <div className="step">
          <FaBell className="step-icon" />
          <h3>Defina lembretes</h3>
          <p>Receba alertas no horário que escolher para não esquecer de nada.</p>
        </div>
        <div className="step">
          <FaCheckCircle className="step-icon" />
          <h3>Conclua e evolua</h3>
          <p>Marque tarefas como concluídas e acompanhe seu progresso.</p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
