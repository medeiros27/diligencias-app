// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// TODO: Adicionar middleware de validação para os corpos das requisições nestas rotas.

/**
 * @route   POST /api/auth/login
 * @desc    Realiza o login para todos os perfis (admin, cliente, correspondente)
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/clientes/register
 * @desc    Regista um novo cliente
 * @access  Public
 */
router.post('/clientes/register', authController.registerCliente);

/**
 * @route   POST /api/auth/correspondentes/register
 * @desc    Regista um novo correspondente
 * @access  Public
 */
router.post('/correspondentes/register', authController.registerCorrespondente);

module.exports = router;
