import axios from 'axios';

// Configura a instância base do axios com variáveis de ambiente
const api = axios.create({
  // ✅ CORREÇÃO AQUI: Garante que a baseURL sempre inclua o prefixo /api
  // Isso fará com que as requisições do frontend correspondam ao 'location /api/' no Nginx.
  // Ex: se REACT_APP_API_BASE_URL no Netlify for 'https://todolistapp22.duckdns.org',
  // a baseURL se tornará 'https://todolistapp22.duckdns.org/api'.
  baseURL: `${process.env.REACT_APP_API_BASE_URL}/api` || 'http://localhost:5000/api',
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptador de requisições: adiciona token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptador de respostas: tratamento global de erros
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Erro de rede ou servidor offline
      console.error('Erro de rede:', error.message);
      return Promise.reject({ 
        message: 'Servidor indisponível. Tente novamente mais tarde.' 
      });
    }
    
    const status = error.response.status;
    let errorMessage = 'Ocorreu um erro inesperado';
    
    switch (status) {
      case 401:
        errorMessage = 'Sessão expirada. Faça login novamente.';
        // Opcional: limpar token inválido
        localStorage.removeItem('token');
        break;
      case 403:
        errorMessage = 'Acesso negado. Você não tem permissão.';
        break;
      case 404:
        errorMessage = 'Recurso não encontrado.';
        break;
      case 500:
        errorMessage = 'Erro interno do servidor.';
        break;
      default:
        // Usa mensagem do backend se disponível
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
    }
    
    console.error(`Erro ${status}:`, errorMessage);
    return Promise.reject({ 
      status, 
      message: errorMessage,
      details: error.response.data 
    });
  }
);

export default api;
