// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// LOGIN AUTH
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

    // Verifica a senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });

    // Gera o token com id e username
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '60d'
    });

    res.json({ token, username: user.username }); // ✅ Inclui username na resposta de login
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao logar', error });
  }
};

// SIGNUP AUTH
exports.signup = async (req, res) => {
  // 1. Normalizar inputs: remover espaços em branco e converter email para minúsculas
  const username = req.body.username.trim();
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  try {
    // ✅ ATUALIZAÇÃO: Unificar verificação e retornar 409 Conflict
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(409).json({ message: 'Nome de usuário já está em uso.' });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(409).json({ message: 'Esse email já está cadastrado.' });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    // Gera token JWT
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username }, // ✅ Inclui username no token do signup
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      userId: newUser._id,
      username: newUser.username,
      message: 'Usuário criado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no signup:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// ✅ NOVAS FUNÇÕES PARA VERIFICAR DISPONIBILIDADE (check-username e check-email)
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Nome de usuário é obrigatório.' });
    }
    const user = await User.findOne({ username: username });
    if (user) {
      return res.json({ available: false, message: 'Nome de usuário não disponível.' });
    }
    res.json({ available: true, message: 'Nome de usuário disponível.' });
  } catch (error) {
    console.error('Erro ao verificar nome de usuário:', error);
    res.status(500).json({ message: 'Erro no servidor ao verificar nome de usuário.' });
  }
};

exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório.' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.json({ available: false, message: 'Esse email já está cadastrado.' });
    }
    res.json({ available: true, message: 'Email disponível.' });
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ message: 'Erro no servidor ao verificar email.' });
  }
};

// ✅ NOVA FUNÇÃO: Obter perfil do usuário
exports.getProfile = async (req, res) => {
    try {
        // req.userId deve ser definido pelo middleware de autenticação
        if (!req.userId) {
            return res.status(401).json({ message: 'Não autorizado: ID do usuário não encontrado no token.' });
        }

        // Busca o usuário pelo ID, excluindo a senha
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // Retorna os dados do usuário (excluindo a senha)
        res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar perfil.' });
    }
};
