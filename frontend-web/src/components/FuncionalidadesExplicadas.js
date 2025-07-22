// src/components/FuncionalidadesExplicadas.js

import React from "react";
import "./FuncionalidadesExplicadas.css";

const FuncionalidadesExplicadas = () => {
  return (
    <section className="explicacao-funcionalidades">
      <h2>☁️ Como funciona o TO DO List?</h2>
      <p>
        O TO DO List é uma aplicação desenvolvida para te ajudar a manter o foco nas tarefas que realmente importam. Com uma interface intuitiva e funcionalidades práticas, você pode:
      </p>

      <ul>
        <li><strong> Criar Tarefas:</strong> Defina um título, descrição, horário e até adicione mídias para organizar melhor.</li>
        <li><strong> Agendar Lembretes:</strong> Escolha com quantos minutos de antecedência deseja ser notificado.</li>
        <li><strong> Acessar com Login:</strong> Cada usuário tem seu perfil com tarefas organizadas de forma segura.</li>
        <li><strong> Responsivo:</strong> Utilize no celular, tablet ou computador, com design que se adapta a qualquer tela.</li>
        <li><strong> Dados salvos:</strong> Suas tarefas ficam disponíveis mesmo que você feche o navegador.</li>
      </ul>

      <p>Experimente agora, organize sua rotina com mais leveza e tenha total controle sobre sua TO DO LIST.</p>
    </section>
  );
};

export default FuncionalidadesExplicadas;
