// backend/controllers/taskListController.js
const TaskList = require('../models/TaskList');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose'); // Importar mongoose para new mongoose.Types.ObjectId()

// Definir o diretório de uploads para as imagens das tarefas
const TASK_IMAGES_DIR = path.join(__dirname, '../uploads/task-images');

// Garante que o diretório de uploads específico para as imagens das tarefas exista.
// Ele criará 'uploads' se não existir, e depois 'task-images' dentro de 'uploads'.
if (!fs.existsSync(TASK_IMAGES_DIR)) {
  fs.mkdirSync(TASK_IMAGES_DIR, { recursive: true });
  console.log(`Diretório de uploads para imagens de tarefas criado: ${TASK_IMAGES_DIR}`);
}

// @route   POST /api/tasklists
// @desc    Cria uma nova lista de tarefas com seus itens
// @access  Privado (requer autenticação)
exports.createTaskList = async (req, res) => {
  const { title, description, items } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ message: 'O título da lista é obrigatório.' });
  }

  try {
    const processedItems = await Promise.all(items.map(async (item) => {
      let imageUrl = null;

      // Se a imagem for uma string Base64 (do frontend-mobile)
      if (item.image && item.image.startsWith('data:image/')) {
        const matches = item.image.match(/^data:(image\/(?:png|jpeg|gif));base64,(.+)$/);
        
        if (matches && matches.length === 3) {
          const imageType = matches[1];
          const base64Data = matches[2];

          const extension = imageType.split('/')[1];
          const fileName = `${uuidv4()}.${extension}`;
          const filePath = path.join(TASK_IMAGES_DIR, fileName);

          try {
            const buffer = Buffer.from(base64Data, 'base64');
            await fs.promises.writeFile(filePath, buffer);
            // A URL agora inclui a subpasta 'task-images'
            imageUrl = `/uploads/task-images/${fileName}`; 
          } catch (fileError) {
            console.error(`Erro ao salvar a imagem para o item "${item.title}":`, fileError);
            imageUrl = null; // Em caso de erro, defina como nulo
          }
        } else {
          console.warn('Formato de imagem Base64 inválido para o item:', item.title);
        }
      } else if (item.image && typeof item.image === 'string') {
        // Se a imagem já for uma URL (ex: de um item existente ou de outra fonte)
        imageUrl = item.image; 
      }

      return {
        _id: item._id || new mongoose.Types.ObjectId(), // Garante que cada item tenha um _id, mesmo se não veio do frontend
        title: item.title,
        link: item.link,
        description: item.description,
        image: imageUrl,
        completed: item.completed || false,
      };
    }));

    const newTaskList = new TaskList({
      userId,
      title,
      description,
      items: processedItems,
      // O lembrete não é definido na criação inicial, será adicionado/atualizado via PUT
    });

    await newTaskList.save();
    res.status(201).json({ message: 'Lista de tarefas criada com sucesso!', taskList: newTaskList });
  } catch (error) {
    console.error('Erro ao criar lista de tarefas:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar lista.', error: error.message });
  }
};

// @route   GET /api/tasklists
// @desc    Obtém todas as listas de tarefas do usuário autenticado
// @access  Privado
exports.getAllTaskLists = async (req, res) => {
  const userId = req.user.id;

  try {
    const taskLists = await TaskList.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(taskLists);
  } catch (error) {
    console.error('Erro ao buscar listas de tarefas:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar listas.', error: error.message });
  }
};

// @route   GET /api/tasklists/:id
// @desc    Obtém uma única lista de tarefas por ID
// @access  Privado
exports.getTaskListById = async (req, res) => {
  try {
    const taskList = await TaskList.findById(req.params.id);

    if (!taskList) {
      return res.status(404).json({ message: 'Lista de tarefas não encontrada.' });
    }

    // Garante que apenas o proprietário da lista possa acessá-la
    if (taskList.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Acesso não autorizado a esta lista de tarefas.' });
    }

    res.status(200).json(taskList);
  } catch (error) {
    console.error('Erro ao buscar lista de tarefas por ID:', error);
    if (error.kind === 'ObjectId') { // Erro de ID inválido do MongoDB
      return res.status(400).json({ message: 'ID da lista de tarefas inválido.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao buscar a lista.', error: error.message });
  }
};

// @route   PUT /api/tasklists/:id
// @desc    Atualiza uma lista de tarefas existente (inclui atualização de itens e lembretes)
// @access  Privado
exports.updateTaskList = async (req, res) => {
  const { title, description, items, reminder } = req.body; // Pega o reminder do corpo da requisição
  const userId = req.user.id;
  const listId = req.params.id; // ID da lista a ser atualizada

  try {
    let taskList = await TaskList.findById(listId);

    if (!taskList) {
      return res.status(404).json({ message: 'Lista de tarefas não encontrada para atualização.' });
    }

    // Garante que apenas o proprietário da lista possa atualizá-la
    if (taskList.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Acesso não autorizado para atualizar esta lista de tarefas.' });
    }

    // Atualiza campos básicos da lista
    if (title !== undefined) taskList.title = title;
    if (description !== undefined) taskList.description = description;

    // Processa os itens da lista
    // IMPORTANTE: Esta lógica assume que o frontend envia o array completo de itens,
    // incluindo o _id para itens existentes. Novos itens sem _id serão tratados como novos.
    if (items) {
      const processedItems = await Promise.all(items.map(async (item) => {
        let imageUrl = item.image; // Assume que a URL da imagem pode vir ou ser nova

        // Se a imagem for uma nova imagem base64, salve-a
        if (item.image && item.image.startsWith('data:image/')) {
          const matches = item.image.match(/^data:(image\/(?:png|jpeg|gif));base64,(.+)$/);
          if (matches && matches.length === 3) {
            const imageType = matches[1];
            const base64Data = matches[2];
            const extension = imageType.split('/')[1];
            const fileName = `${uuidv4()}.${extension}`;
            const filePath = path.join(TASK_IMAGES_DIR, fileName);

            try {
              const buffer = Buffer.from(base64Data, 'base64');
              await fs.promises.writeFile(filePath, buffer);
              imageUrl = `/uploads/task-images/${fileName}`; 
            } catch (fileError) {
              console.error(`Erro ao salvar nova imagem para o item "${item.title}":`, fileError);
              imageUrl = null; // Em caso de erro, defina como nulo
            }
          } else {
            console.warn('Formato de imagem Base64 inválido durante atualização para o item:', item.title);
          }
        }
        // Se item.image for null ou string vazia e havia uma imagem anterior, podemos limpar
        // ou você pode adicionar lógica para deletar o arquivo antigo se desejar.
        // Por enquanto, apenas atualiza a referência.

        return {
          _id: item._id || new mongoose.Types.ObjectId(), // Reutiliza _id existente ou cria um novo
          title: item.title,
          link: item.link,
          description: item.description,
          image: imageUrl,
          completed: item.completed || false,
        };
      }));
      taskList.items = processedItems;
    }

    // Atualiza o lembrete
    if (reminder !== undefined) { // Permite que o reminder seja null para remover
      taskList.reminder = reminder;
    } else {
      // Se reminder não for enviado, e existia um, mantenha o existente ou defina como null se precisar de remoção explícita
      // Ex: se quiser permitir remover lembrete enviando reminder: null
      // taskList.reminder = null; 
    }
    
    // Atualiza a data de modificação
    taskList.updatedAt = Date.now();

    await taskList.save();

    res.status(200).json({ message: 'Lista de tarefas atualizada com sucesso!', taskList: taskList });
  } catch (error) {
    console.error('Erro ao atualizar lista de tarefas:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'ID da lista de tarefas inválido.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar a lista.', error: error.message });
  }
};

// @route   DELETE /api/tasklists/:id
// @desc    Exclui uma lista de tarefas existente
// @access  Privado
exports.deleteTaskList = async (req, res) => {
  const userId = req.user.id;
  const listId = req.params.id; // ID da lista a ser excluída

  try {
    const taskList = await TaskList.findById(listId);

    if (!taskList) {
      return res.status(404).json({ message: 'Lista de tarefas não encontrada para exclusão.' });
    }

    // Garante que apenas o proprietário da lista possa excluí-la
    if (taskList.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Acesso não autorizado para excluir esta lista de tarefas.' });
    }

    // Opcional: Deletar imagens associadas aos itens da lista
    // Esta é uma boa prática para evitar "lixo" no servidor.
    for (const item of taskList.items) {
      if (item.image && item.image.startsWith('/uploads/task-images/')) {
        const imageFileName = path.basename(item.image);
        const imagePath = path.join(TASK_IMAGES_DIR, imageFileName);
        
        try {
          if (fs.existsSync(imagePath)) { // Verifica se o arquivo realmente existe antes de tentar deletar
            await fs.promises.unlink(imagePath);
            console.log(`Imagem do item ${imageFileName} deletada com sucesso.`);
          }
        } catch (fileError) {
          console.warn(`Aviso: Não foi possível deletar a imagem ${imageFileName}:`, fileError.message);
          // Não retorna erro 500 se a imagem não puder ser deletada, pois a lista ainda pode ser excluída.
        }
      }
    }

    await taskList.deleteOne(); // Usa deleteOne() que é o método recomendado para instâncias de modelo

    res.status(200).json({ message: 'Lista de tarefas excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir lista de tarefas:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'ID da lista de tarefas inválido.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao excluir a lista.', error: error.message });
  }
};
