// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // ✅ Mantém para compatibilidade, se outras partes do código usarem req.user
    req.userId = verified.id; // ✅ ADICIONADO: Define req.userId para consistência com authController.js
    next();
  } catch (err) {
    console.error('Erro de autenticação (token inválido/expirado):', err);
    return res.status(401).json({ message: 'Token inválido ou expirado. Faça login novamente.' });
  }
};

module.exports = auth;
