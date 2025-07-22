// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from "react-icons/fa"; // ✅ Importação dos ícones de olho

// ✅ Receber as props onLoginSuccess e setUsername do App.js
function Login({ onLoginSuccess, setUsername }) { // <-- Alterado aqui
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // ✅ NOVO ESTADO: Para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // ✅ FUNÇÃO PARA ALTERNAR A VISIBILIDADE DA SENHA
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);

      // ✅ Chamada à função onLoginSuccess passada pelo App.js
      // Assumimos que a resposta do backend 'res.data' contém 'token' e 'username'
      onLoginSuccess(res.data.token, res.data.username);
      toast.success('Login bem-sucedido, comece pelo seu perfil!');

      // A linha localStorage.setItem('token', res.data.token); foi movida para onLoginSuccess
      // A linha navigate('/profile'); ainda está aqui para redirecionar após o sucesso.
      navigate('/profile');
    } catch (err) {
      console.error("Erro no login:", err.response ? err.response.data : err.message); // Melhorar o log
      // Verifica se a mensagem de erro específica do backend está disponível
      setError(err.response?.data?.message || 'Email ou senha inválidos');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* ✅ CONTAINER PARA SENHA + BOTÃO DE TOGGLE */}
        <div className="input-with-icon"> {/* Reutilizando a classe, se estiver no seu CSS */}
          <input
            // ✅ Muda o tipo do input com base no estado showPassword
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {/* ✅ Botão para alternar a visibilidade da senha */}
          <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Entrar</button>
      </form>
      <p className='explanation'>Não tem conta? <Link className='option' to="/signup">Criar conta</Link></p>
    </div>
  );
}

export default Login;