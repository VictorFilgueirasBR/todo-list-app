// backend/routes/profile.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController'); 
const verifyToken = require('../middlewares/verifyToken');
const upload = require('../middlewares/uploadMiddleware');

// ✅ Atualizar nome de usuário
router.put('/username', verifyToken, profileController.updateUsername);

// ✅ Obter perfil do usuário
router.get('/', verifyToken, profileController.getProfile);

// ✅ Upload de avatar ou banner (protegido!)
router.put('/uploads/avatars', verifyToken, upload.single('image'), profileController.uploadAvatar);


module.exports = router;
