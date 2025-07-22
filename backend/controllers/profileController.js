// Importações necessárias
const mongoose = require('mongoose');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Função auxiliar para remover arquivos
const removeFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Controller para atualizar nome de usuário
exports.updateUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Nome de usuário inválido.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    user.username = username.trim();
    await user.save();

    res.status(200).json({
      message: 'Nome de usuário atualizado com sucesso.',
      username: user.username
    });
  } catch (error) {
    console.error('Erro ao atualizar nome de usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// ✅ Controller para upload de avatar (anteriormente uploadImage)
exports.uploadAvatar = async (req, res) => { // ✅ Função renomeada para uploadAvatar
  const userId = req.user.id;
  

  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const filename = req.file.filename;
    let relativePath = '';

    // ✅ Lógica simplificada: sempre lidar com avatar
    if (user.avatar) {
      const oldPath = path.join(__dirname, '../uploads/avatars', user.avatar);
      removeFile(oldPath);
    }
    user.avatar = filename;
    relativePath = `/uploads/avatars/${filename}`; // ✅ Caminho corrigido para consistência


    await user.save();
    res.json({
      message: 'Avatar atualizado com sucesso', // ✅ Mensagem de sucesso específica
      avatar: relativePath // ✅ Retorna diretamente 'avatar' com o caminho relativo
    });
  } catch (err) {
    console.error('Erro ao enviar avatar:', err); // ✅ Mensagem de erro específica
    res.status(500).json({ error: 'Erro ao enviar avatar' }); // ✅ Mensagem de erro específica
  }
};

// Controller para obter dados do perfil
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validação de ID usando Mongoose
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "ID de usuário inválido." });
    }

    // ✅ Remover 'banner' da seleção
    const user = await User.findById(userId).select('username email avatar createdAt');

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Construção do objeto de resposta
    const profileData = {
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      profileImage: user.avatar ? `/uploads/avatars/${user.avatar}` : null,
      // ❌ Removida a linha de bannerImage
      // bannerImage: user.banner ? `/uploads/banners/${user.banner}` : null
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.status(500).json({ error: "Erro ao carregar perfil." });
  }
};