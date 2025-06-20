/**
 * routes/cliente.routes.js
 * Define as rotas da API para a gestão de clientes, com validação de dados.
 */
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/cliente.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { clienteRules, validate } = require('../validators/validators');

// Middleware para verificar se o utilizador é admin em todas as rotas
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.perfil === 'admin') {
        return next();
    }
    res.status(403).send({ message: "Acesso negado. Requer perfil de administrador." });
};

// Aplica o middleware de verificação de token e de autorização de admin a todas as rotas
router.use(authMiddleware.verifyToken, authorizeAdmin);

// Rotas CRUD para Clientes com validação
router.post('/', clienteRules(), validate, clienteController.createCliente);
router.get('/', clienteController.getAllClientes);
router.get('/:id', clienteController.getClienteById);
// Na atualização, não validamos a senha, que é opcional
router.put('/:id', clienteRules(), validate, clienteController.updateCliente);
router.patch('/:id/status', clienteController.updateClienteStatus);

module.exports = router;
