// frontend-mobile/src/services/api.js
import axios from 'axios'; // Importa a biblioteca axios

// Define a URL base da sua API
const API_BASE_URL = 'http://192.168.0.23:5000'; // Substitua pelo IP do seu computador na rede local

// Cria uma instância do axios com a URL base configurada
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Exporta essa instância para que possa ser usada em outros arquivos
export default api;