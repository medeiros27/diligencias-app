// routes/user.routes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protectRoute, authorize } = require('../middlewares/auth.middleware');

// Todas as rotas neste ficheiro são para gestão de utilizadores
// e devem ser acessíveis apenas por administradores.
// Aplicamos os middlewares a todas as rotas de uma só vez.
router.use(protectRoute, authorize('admin'));

/**
 * @route   GET /api/users/clientes
 * @desc    Lista todos os clientes
 * @access  Private (Apenas Admins)
 */
router.get('/clientes', userController.listClientes);

/**
 * @route   GET /api/users/correspondentes
 * @desc    Lista todos os correspondentes
 * @access  Private (Apenas Admins)
 */
router.get('/correspondentes', userController.listCorrespondentes);

/**
 * @route   PUT /api/users/clientes/:id/status
 * @desc    Atualiza o status (ativo/inativo) de um cliente
 * @access  Private (Apenas Admins)
 */
router.put('/clientes/:id/status', userController.updateClienteStatus);

/**
 * @route   PUT /api/users/correspondentes/:id/status
 * @desc    Atualiza o status (ativo/inativo) de um correspondente
 * @access  Private (Apenas Admins)
 */
router.put('/correspondentes/:id/status', userController.updateCorrespondenteStatus);


module.exports = router;
