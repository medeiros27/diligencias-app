/**
 * routes/user.routes.js
 * Define as rotas para a gestão de status de clientes e correspondentes por administradores.
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

// Aplica a verificação de token a todas as rotas deste ficheiro
router.use(verifyToken);

// Todas as rotas abaixo são apenas para administradores
router.get('/clientes', authorize('admin'), userController.listClientes);
router.get('/correspondentes', authorize('admin'), userController.listCorrespondentes);
router.put('/clientes/:id/status', authorize('admin'), userController.updateClienteStatus);
router.put('/correspondentes/:id/status', authorize('admin'), userController.updateCorrespondenteStatus);

module.exports = router;
