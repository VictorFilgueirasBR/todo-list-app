import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './SignUp.css';
import toast from 'react-hot-toast';
import { FcCancel, FcOk } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // ✅ Importação dos ícones de olho

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [usernameAvailability, setUsernameAvailability] = useState(null);
  const [emailAvailability, setEmailAvailability] = useState(null);

  const [usernameTimer, setUsernameTimer] = useState(null);
  const [emailTimer, setEmailTimer] = useState(null);

  // ✅ NOVO ESTADO: Para controlar a visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);

  // ✅ FUNÇÃO PARA ALTERNAR A VISIBILIDADE DA SENHA
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const validatePassword = (password) => {
    let errors = [];

    if (password.length < 8) {
      errors.push('A senha deve ter pelo menos 8 caracteres.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('A senha deve conter pelo menos um número.');
    }
    if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial (ex: !@#$%).');
    }

    if (errors.length > 0) {
      setPasswordError(errors.join('\n'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailability(null);
      return;
    }
    setUsernameAvailability('checking');
    try {
      const res = await api.post('/auth/check-username', { username });
      if (res.data.available) {
        setUsernameAvailability('available');
      } else {
        setUsernameAvailability('taken');
        toast.error('Nome de usuário não disponível.', { id: 'username-toast' });
      }
    } catch (err) {
      console.error('Erro ao verificar nome de usuário:', err);
      setUsernameAvailability('error');
    }
  };

  const checkEmailAvailability = async (email) => {
    if (!email.includes('@') || email.length < 5) {
      setEmailAvailability(null);
      return;
    }
    setEmailAvailability('checking');
    try {
      const res = await api.post('/auth/check-email', { email });
      if (res.data.available) {
        setEmailAvailability('available');
      } else {
        setEmailAvailability('taken');
        toast.error('Esse email já está cadastrado.', { id: 'email-toast' });
      }
    } catch (err) {
      console.error('Erro ao verificar email:', err);
      setEmailAvailability('error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      validatePassword(value);
    } else if (name === 'username') {
      if (usernameTimer) {
        clearTimeout(usernameTimer);
      }
      const newTimer = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      setUsernameTimer(newTimer);
    } else if (name === 'email') {
      if (emailTimer) {
        clearTimeout(emailTimer);
      }
      const newTimer = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500);
      setEmailTimer(newTimer);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    const isPasswordValid = validatePassword(formData.password);
    if (!isPasswordValid) {
      return;
    }

    if (usernameAvailability === 'taken') {
      toast.error('Por favor, escolha outro nome de usuário.', { id: 'username-submit-toast' });
      return;
    }
    if (emailAvailability === 'taken') {
      toast.error('Por favor, use um email diferente.', { id: 'email-submit-toast' });
      return;
    }
    if (usernameAvailability === 'checking' || emailAvailability === 'checking') {
      toast.error('Aguarde a verificação de disponibilidade.', { id: 'checking-toast' });
      return;
    }

    try {
      const res = await api.post('/auth/signup', formData);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        toast.success('Cadastro realizado com sucesso! Faça login.');
      }

      navigate('/login');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro desconhecido ao criar conta';

      if (err.response && err.response.status === 409) {
        if (errorMessage.includes('username')) {
          toast.error('Nome de usuário não disponível.');
          setUsernameAvailability('taken');
        } else if (errorMessage.includes('email')) {
          toast.error('Esse email já está cadastrado.');
          setEmailAvailability('taken');
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
      console.error('Erro detalhado:', err.response?.data || err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Criar Conta</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-with-icon">
          <input
            type="text"
            name="username"
            placeholder="Nome de usuário"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
          />
          {usernameAvailability === 'available' && <FcOk className="input-icon success-icon" />}
          {usernameAvailability === 'taken' && <FcCancel className="input-icon error-icon" />}
        </div>
        {usernameAvailability === 'checking' && <p className="checking-message">Verificando...</p>}
        {usernameAvailability === 'available' && <p className="available-message">Nome de usuário disponível!</p>}
        {usernameAvailability === 'taken' && <p className="taken-message">Nome de usuário não disponível.</p>}

        <div className="input-with-icon">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {emailAvailability === 'available' && <FcOk className="input-icon success-icon" />}
          {emailAvailability === 'taken' && <FcCancel className="input-icon error-icon" />}
        </div>
        {emailAvailability === 'checking' && <p className="checking-message">Verificando...</p>}
        {emailAvailability === 'available' && <p className="available-message">Email disponível!</p>}
        {emailAvailability === 'taken' && <p className="taken-message">Esse email já está cadastrado.</p>}

        {/* ✅ CONTAINER PARA SENHA + BOTÃO DE TOGGLE */}
        <div className="input-with-icon">
          <input
            // ✅ Muda o tipo do input com base no estado showPassword
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
          {/* ✅ Botão para alternar a visibilidade da senha */}
          <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {passwordError && (
          <div className="password-requirements">
            <p>Requisitos da senha:</p>
            {passwordError.split('\n').map((msg, index) => (
              <p key={index} className="password-error-message">- {msg}</p>
            ))}
          </div>
        )}

        <button type="submit">Cadastrar</button>
      </form>
      <p className='explanation'>Já tem conta? <Link className='option' to="/login">Entrar</Link></p>
    </div>
  );
}

export default SignUp;