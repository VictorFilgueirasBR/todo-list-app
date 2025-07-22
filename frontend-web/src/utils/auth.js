// src/utils/auth.js

// Recupera o token do localStorage
export const getToken = () => localStorage.getItem('token');

// Verifica se o usuário está autenticado (token existe e está válido)
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  // (Opcional) Verificar se o token expirou, se estiver usando JWT com exp
  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      logout();
      return false;
    }

    return true;
  } catch (e) {
    // Se falhar na decodificação do token, considera inválido
    logout();
    return false;
  }
};

// Remove o token (logout)
export const logout = () => localStorage.removeItem('token');
