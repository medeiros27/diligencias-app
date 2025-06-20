/**
 * routes/demanda.routes.js
 * Define as rotas da API para a gestão de demandas, com validação e autorização explícita.
 */
const express = require('express');
const router = express.Router();
const demandaController = require('../controllers/demanda.controller');
const anexoController = require('../controllers/anexo.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const { demandaRules, validate } = require('../validators/validators');
const upload = require('../middlewares/upload.middleware');

// Aplica o middleware de autenticação a todas as rotas de demanda
router.use(verifyToken);

// --- Rotas de Demandas ---
router.post('/', authorize('cliente'), demandaRules(), validate, demandaController.createDemanda);
router.get('/minhas', demandaController.getMinhasDemandas);
router.get('/:id', demandaController.getDemandaById);
router.patch('/assign/:id', authorize('admin'), demandaController.assignDemanda);
router.patch('/status/:id', authorize('admin', 'correspondente'), demandaController.updateDemandaStatus);

// --- Rotas de Anexos ---
router.post('/:id/anexos', upload.single('anexo'), anexoController.uploadAnexo);
router.get('/:id/anexos', anexoController.getAnexosByDemanda);

module.exports = router;
