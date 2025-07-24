// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth'); // ✅ ALTERADO: Importa o middleware 'auth' do arquivo correto

// Rota de cadastro
router.post('/signup', authController.signup);

// ✅ Rota de login
router.post('/login', authController.login);

// ✅ NOVAS ROTAS PARA VERIFICAÇÃO DE DISPONIBILIDADE
router.post('/check-username', authController.checkUsername);
router.post('/check-email', authController.checkEmail);

// ✅ NOVA ROTA: Obter perfil do usuário
// Esta rota requer autenticação (middleware 'auth') para garantir que apenas o usuário logado possa acessar seu perfil.
router.get('/profile', auth, authController.getProfile); // ✅ ALTERADO: Usa o middleware 'auth'

module.exports = router;
