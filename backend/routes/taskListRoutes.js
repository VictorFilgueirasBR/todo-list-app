// backend/routes/taskListRoutes.js
const express = require('express');
const router = express.Router(); // Cria um novo roteador Express
const taskListController = require('../controllers/taskListController'); // Importa o controlador
const auth = require('../middlewares/auth'); // Importa o middleware de autenticação (se ainda for usado em outros lugares)
const verifyToken = require('../middlewares/verifyToken'); // ✅ Usando este middleware, então mantenha-o


// @route   POST /api/tasklists
// @desc    Cria uma nova lista de tarefas com seus itens
// @access  Privado (requer um token de autenticação JWT válido)
router.post('/', verifyToken, taskListController.createTaskList);

// @route   GET /api/tasklists
// @desc    Obtém todas as listas de tarefas do usuário autenticado
// @access  Privado
router.get('/', verifyToken, taskListController.getAllTaskLists);

// ✅ NOVO: @route   GET /api/tasklists/:id
// @desc    Obtém uma única lista de tarefas por ID
// @access  Privado
router.get('/:id', verifyToken, taskListController.getTaskListById); // Descomentado e pronto para uso!

// ✅ NOVO: @route   PUT /api/tasklists/:id
// @desc    Atualiza uma lista de tarefas existente (inclui atualização de itens e lembretes)
// @access  Privado
router.put('/:id', verifyToken, taskListController.updateTaskList);

// ✅ NOVO: @route   DELETE /api/tasklists/:id
// @desc    Exclui uma lista de tarefas existente
// @access  Privado
router.delete('/:id', verifyToken, taskListController.deleteTaskList);

module.exports = router;