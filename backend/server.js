// server.js 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Rotas
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profile'); // Inclui: GET, PATCH e POST imagem
// ✅ NOVO: Importa as rotas para listas de tarefas
const taskListRoutes = require('./routes/taskListRoutes');

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o app
const app = express();

// Middlewares globais
// Configuração de CORS para permitir requisições do frontend Netlify
app.use(cors({
  origin: 'https://neon-blancmange-912087.netlify.app', // Permite requisições apenas do seu frontend Netlify
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos HTTP permitidos
  credentials: true // Permite o envio de cookies de autenticação (se usados)
}));

// ✅ Aumentar o limite do tamanho do corpo da requisição JSON e URL-encoded
app.use(express.json({ limit: '100mb' })); // Aumenta o limite para JSON
app.use(express.urlencoded({ limit: '100mb', extended: true })); // Aumenta o limite para URL-encoded, se aplicável

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // Inclui: GET perfil, PATCH nome, POST imagem
// ✅ NOVO: Monta as rotas para listas de tarefas sob o prefixo /api/tasklists
app.use('/api/tasklists', taskListRoutes);


// Rota de teste
app.get('/', (req, res) => {
  res.send('✅ API está rodando com sucesso');
});

// Conecta ao MongoDB e inicia o servidor
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Tempo limite de seleção do servidor em milissegundos (30 segundos)
    socketTimeoutMS: 45000, // Tempo limite do socket em milissegundos (45 segundos)
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor em http://localhost:${PORT}`);
    });
    console.log('✅ MongoDB conectado!'); // Mensagem de sucesso na conexão
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
  });
