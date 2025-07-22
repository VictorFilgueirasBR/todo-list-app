// backend/models/TaskItem.js
const mongoose = require('mongoose');

// Este schema é para os itens individuais dentro de uma lista de tarefas.
// Não será um modelo Mongoose independente, mas um subdocumento.
const TaskItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  link: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    trim: true,
    maxlength: 250,
    default: '',
  },
  // ✅ CORREÇÃO NO COMENTÁRIO: Este campo armazena o caminho/URL da imagem no servidor,
  // após o processamento da Base64 no controlador.
  image: {
    type: String, // Armazenará o caminho do arquivo da imagem no servidor (ex: /uploads/task-images/nome-do-arquivo.png)
    default: null,
  },
  // Adicionei um campo 'completed' que é comum em To-Do Lists
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Exportamos apenas o schema, não um modelo.
// Ele será importado e usado dentro de TaskListSchema.
module.exports = TaskItemSchema;
