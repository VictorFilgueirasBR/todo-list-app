// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de cadastro
router.post('/signup', authController.signup);


// ✅ Rota de login
router.post('/login', authController.login);

// ✅ NOVAS ROTAS PARA VERIFICAÇÃO DE DISPONIBILIDADE
router.post('/check-username', authController.checkUsername);
router.post('/check-email', authController.checkEmail);


module.exports = router;
