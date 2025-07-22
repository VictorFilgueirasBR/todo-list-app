// src/components/CustomizeListPopup.js
import React, { useState } from 'react';
import { LuCopy } from 'react-icons/lu'; // Ícone para copiar
import toast from 'react-hot-toast'; // Para exibir mensagens de sucesso/erro na cópia
import './CustomizeListPopup.css';

const CustomizeListPopup = ({ onClose, code = "" }) => { 
  // eslint-disable-next-line no-unused-vars
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        toast.success('Código copiado!', {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
        setTimeout(() => setCopied(false), 2000); 
      })
      .catch((err) => {
        console.error('Erro ao copiar código: ', err);
        toast.error('Erro ao copiar código.', {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
      });
  };

  return (
    <div className="customize-popup-overlay">
      <div className="customize-popup-content">
        {/* O botão de fechar redundante foi REMOVIDO daqui. */}
        
        {/* Estrutura para o display de código - Esta é a parte principal */}
        <div className="code-block-container">
          <div className="code-block-header">
            <span className="language-label">JavaScript</span>
            <button className="copy-button" onClick={handleCopyToClipboard} title="Copiar código">
              <LuCopy size={18} /> 
            </button>
          </div>
          <div className="code-block-body">
            <pre>
              {/* ONDE O CÓDIGO É EXIBIDO - É SÓ O TEXTO AQUI */}
              <code>
                {code}
              </code>
            </pre>
          </div>
        </div>

        {/* Botão "Fechar" inferior */}
        <button className="customize-popup-done-button" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default CustomizeListPopup;