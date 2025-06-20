/**
 * routes/auth.routes.js
 * Define as rotas para o fluxo de autenticação.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @route   POST /api/auth/signin
 * @desc    Autentica um utilizador e retorna um token JWT.
 * @access  Public
 */
// CORREÇÃO: A rota foi alterada para /signin e o nome da função para authController.signin.
router.post('/signin', authController.signin);

module.exports = router;
