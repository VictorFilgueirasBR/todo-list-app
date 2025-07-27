import React from "react";
import HeaderBanner from "../components/HeaderBanner";
import headerGif from "../assets/header-img.png";
import "./Home.css";
import FuncionalidadesExplicadas from "../components/FuncionalidadesExplicadas";
import ClassListOrder from "../components/ClassListOrder";


const Home = () => {
  return (
    <div className="home-wrapper">
      {/* Componente reutilizável da Capa */}
      <HeaderBanner gifSrc={headerGif} />

      {/* Conteúdo principal */}
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-text">
            <h1>Organize sua rotina com eficiência</h1>
            <p>Crie, edite e receba lembretes das suas tarefas de forma intuitiva e prática.</p>
            <a href="https://neon-blancmange-912087.netlify.app/login" className="cta-button">Começar Agora</a>
          </div>
        </section>

        {/* Divisor visual entre Header e nova body */}
        <section className="divider-section-home">
          <hr className="divider-line" />
          <span className="divider-text">TO DO LIST</span>
          <hr className="divider-line" />
        </section>

        {/* Features Section */}
        <section id="features" className="features">
          <h2>Principais Funcionalidades</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Criação de Tarefas</h3>
              <p>Adicione novas tarefas com título, descrição, mídia e horário definido.</p>
            </div>
            <div className="feature-card">
              <h3>Lembretes Inteligentes</h3>
              <p>Receba alertas antes do prazo expirar com base no horário definido.</p>
            </div>
            <div className="feature-card">
              <h3>Design Responsivo</h3>
              <p>Acesse sua lista de tarefas com visual limpo e adaptado para qualquer tela.</p>
            </div>
          </div>
        </section>

        <FuncionalidadesExplicadas />

        <ClassListOrder />


        {/* About */}
        <section className="about">
          <h2>Sobre o Projeto</h2>
          <p>
            Meu primeiro projeto publico como Engenheiro de Software e desenvolvedor fullstack. Analisando sempre as melhores opções para aplicação de boas práticas de desenvolvimento web/mobile com designs intuitívos, pesquisador na área de dados e Machine Learning.
          </p>
        </section>

        {/* Footer */}
        <footer className="footer">
          <p>
            © 2025 TO DO LIST App. Todos os direitos reservados.
            <a
              href="https://github.com/VictorFilgueirasBR/"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </footer>

      </div>
    </div>
  );
};

export default Home;
