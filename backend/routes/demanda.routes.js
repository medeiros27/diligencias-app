// routes/demanda.routes.js

const express = require('express');
const router = express.Router();
const demandaController = require('../controllers/demanda.controller');
const { protectRoute, authorize } = require('../middlewares/auth.middleware');

// Todas as rotas abaixo desta linha requerem que o utilizador esteja autenticado.
// O middleware `protectRoute` é aplicado a todas elas.
router.use(protectRoute);

/**
 * @route   GET /api/demandas/minhas
 * @desc    Lista as diligências para o utilizador logado (seja admin, cliente ou correspondente).
 * @access  Private (Todos os perfis logados)
 */
router.get('/minhas', demandaController.getMinhasDemandas);

/**
 * @route   POST /api/demandas
 * @desc    Cria uma nova diligência.
 * @access  Private (Apenas Clientes)
 */
router.post('/', authorize('cliente'), demandaController.createDemanda);

/**
 * @route   GET /api/demandas/:id
 * @desc    Busca uma diligência específica pelo ID.
 * @access  Private (Admin, ou o Cliente/Correspondente dono da diligência)
 */
router.get('/:id', demandaController.getDemandaById);

/**
 * @route   PUT /api/demandas/:id/atribuir
 * @desc    Atribui uma diligência a um correspondente.
 * @access  Private (Apenas Admins)
 */
router.put(
  '/:id/atribuir',
  authorize('admin'),
  demandaController.assignDemanda
);

/**
 * @route   PUT /api/demandas/:id/status
 * @desc    Atualiza o status de uma diligência.
 * @access  Private (Admin ou o Correspondente responsável)
 */
router.put(
  '/:id/status',
  authorize('admin', 'correspondente'),
  demandaController.updateDemandaStatus
);

module.exports = router;
