const express = require('express');
const router = express.Router();
const controller = require('../controllers/solicitantes.controller');
const { pessoaValidationRules, validate } = require('../validators/validators');

router.get('/solicitantes', controller.getAll);
router.post('/solicitantes', pessoaValidationRules(), validate, controller.create);
router.put('/solicitantes/:id', pessoaValidationRules(), validate, controller.update);
router.delete('/solicitantes/:id', controller.delete);

module.exports = router;
