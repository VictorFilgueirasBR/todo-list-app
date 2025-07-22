// backend/scripts/clearDB.js
require('dotenv').config(); // Para carregar variáveis de ambiente (como sua URI do MongoDB)
const mongoose = require('mongoose');
const User = require('../models/User'); // Assumindo que você tem um modelo User
const TaskList = require('../models/TaskList'); // Assumindo que você tem um modelo TaskList

// Adicione todos os seus modelos aqui
const models = {
  User,
  TaskList,
  // ... outros modelos
};

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/todolist_db'; // Sua URI do MongoDB

mongoose.connect(DB_URI)
  .then(async () => {
    console.log('Conectado ao MongoDB para limpeza...');
    console.log('Iniciando limpeza do banco de dados...');

    for (const modelName in models) {
      try {
        await models[modelName].deleteMany({}); // Deleta todos os documentos da coleção
        console.log(`Coleção ${modelName} limpa.`);
      } catch (error) {
        console.error(`Erro ao limpar coleção ${modelName}:`, error);
      }
    }

    console.log('Limpeza do banco de dados concluída!');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  })
  .finally(async () => { // <--- Adicione 'async' aqui
        try {
          await mongoose.connection.close(); // <--- Remova o callback e use await
          console.log('Conexão com MongoDB fechada.');
        } catch (closeError) {
          console.error('Erro ao fechar conexão com MongoDB:', closeError);
        } finally {
          process.exit(0); // Garante que o script termine, independentemente de erro no fechamento
        }
    });