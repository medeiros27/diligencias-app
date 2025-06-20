/**
 * routes/correspondente.routes.js
 * Define as rotas da API para a gestão de correspondentes, com validação de dados.
 */
const express = require('express');
const router = express.Router();
const correspondenteController = require('../controllers/correspondente.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { correspondenteRules, validate } = require('../validators/validators');

// Middleware para verificar se o utilizador é admin em todas as rotas
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.perfil === 'admin') {
        return next();
    }
    res.status(403).send({ message: "Acesso negado. Requer perfil de administrador." });
};

// Aplica o middleware de verificação de token e de autorização de admin a todas as rotas
router.use(authMiddleware.verifyToken, authorizeAdmin);

// Rotas CRUD para Correspondentes com validação
router.post('/', correspondenteRules(), validate, correspondenteController.createCorrespondente);
router.get('/', correspondenteController.getAllCorrespondentes);
router.get('/:id', correspondenteController.getCorrespondenteById);
router.put('/:id', correspondenteRules(), validate, correspondenteController.updateCorrespondente);
router.patch('/:id/status', correspondenteController.updateCorrespondenteStatus);

module.exports = router;
