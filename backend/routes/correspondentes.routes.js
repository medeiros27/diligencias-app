const express = require('express');
const router = express.Router();
const controller = require('../controllers/correspondentes.controller');
const { pessoaValidationRules, validate } = require('../validators/validators');

router.get('/correspondentes', controller.getAll);
router.post('/correspondentes', pessoaValidationRules(), validate, controller.create);
router.put('/correspondentes/:id', pessoaValidationRules(), validate, controller.update);
router.delete('/correspondentes/:id', controller.delete);

module.exports = router;
