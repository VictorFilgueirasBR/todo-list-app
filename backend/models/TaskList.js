// backend/models/TaskList.js
const mongoose = require('mongoose');
const TaskItemSchema = require('./TaskItem'); // ✅ Importa o schema do item de tarefa

// ✅ NOVO: Definir o schema para o lembrete
const ReminderSchema = new mongoose.Schema({
    date: {
        type: String, // Ou Date, se quiser manipular como objeto Date no backend
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
});

const TaskListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia o modelo de Usuário (assumindo que você tem um User model)
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 250,
    default: '',
  },
  // ✅ NOVO: Array de subdocumentos para os itens da lista.
  // Cada item neste array será um objeto que segue o TaskItemSchema.
  items: [TaskItemSchema],
  // ✅ NOVO: Campo para o lembrete (subdocumento)
    reminder: {
        type: ReminderSchema,
        default: null, // Pode ser nulo se nenhum lembrete for definido
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TaskList', TaskListSchema);