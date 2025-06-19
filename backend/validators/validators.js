const { body, validationResult } = require('express-validator');

// Middleware para executar a validação e retornar erros se existirem
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  // Extrai as mensagens de erro para enviar ao frontend
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

// Regras de validação para Diligências
const demandaValidationRules = () => {
  return [
    body('tipoDemanda').notEmpty().withMessage('O tipo da diligência é obrigatório.'),
    body('valorReceber').isFloat({ gt: -0.01 }).withMessage('O valor a receber deve ser um número válido.'),
    body('valorCorrespondente').isFloat({ gt: -0.01 }).withMessage('O valor do correspondente deve ser um número válido.'),
    body('custasExtras').isFloat({ gt: -0.01 }).withMessage('As custas extras devem ser um número válido.'),
    body('dataDemanda').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('A data da diligência é inválida.'),
  ];
};

// Regras de validação para Solicitantes e Correspondentes
const pessoaValidationRules = () => {
  return [
    body('nome').notEmpty().withMessage('O nome é obrigatório.'),
  ];
};

module.exports = {
  validate,
  demandaValidationRules,
  pessoaValidationRules,
};
