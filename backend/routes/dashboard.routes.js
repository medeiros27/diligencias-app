const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

// Rota para buscar todos os dados consolidados do dashboard
router.get('/dashboard', controller.getDashboardData);

module.exports = router;
