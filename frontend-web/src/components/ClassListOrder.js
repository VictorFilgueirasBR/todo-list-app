// src/components/ClassListOrder.js
import React from 'react';
// import { FiCircle } from 'react-icons/fi'; // ✅ Removida a importação
import './ClassListOrder.css'; // Importa o CSS para este componente

const ClassListOrder = () => {
  return (
    <div className="class-list-order-legend">
      <h3>Lembretes inteligentes definidos por cores.</h3>
      <div className="legend-item">
        {/* ✅ Substituído FiCircle por um div simples */}
        <div className="legend-color-dot urgent-red-border"></div>
        <p>Faltam 6 horas ou menos para a conclusão da lista.</p>
      </div>
      <div className="legend-item">
        {/* ✅ Substituído FiCircle por um div simples */}
        <div className="legend-color-dot urgent-orange-border"></div>
        <p>Faltam 36 horas ou menos para a conclusão da lista.</p>
      </div>
      <div className="legend-item">
        {/* ✅ Substituído FiCircle por um div simples */}
        <div className="legend-color-dot urgent-green-border"></div>
        <p>Faltam 5 dias ou menos para conclusão da lista.</p>
      </div>
    </div>
  );
};

export default ClassListOrder;