/**
 * validators/validators.js
 * Centraliza todas as regras de validação da aplicação usando express-validator.
 */
const { body, validationResult } = require('express-validator');

/**
 * Middleware que verifica os resultados da validação e formata os erros.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // Sem erros, continua para o controlador.
  }

  // Extrai e formata as mensagens de erro para uma resposta clara.
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    message: "Erro de validação nos dados enviados.",
    errors: extractedErrors,
  });
};

/**
 * Regras de validação para a criação/atualização de Clientes.
 */
const clienteRules = () => [
    body('nome_completo').trim().notEmpty().withMessage('O nome completo é obrigatório.'),
    body('email').isEmail().withMessage('Deve fornecer um endereço de email válido.').normalizeEmail(),
    body('telefone').trim().notEmpty().withMessage('O número de telefone é obrigatório.'),
    // A validação de senha só é necessária na criação.
    body('senha').if(body('senha').exists()).isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
];

/**
 * Regras de validação para a criação/atualização de Correspondentes.
 */
const correspondenteRules = () => [
    body('nome_completo').trim().notEmpty().withMessage('O nome completo é obrigatório.'),
    body('email').isEmail().withMessage('Deve fornecer um endereço de email válido.').normalizeEmail(),
    body('cpf').trim().notEmpty().withMessage('O CPF é obrigatório.'), // Poderia ter uma validação de formato de CPF aqui.
    body('telefone').trim().notEmpty().withMessage('O número de telefone é obrigatório.'),
    body('comarcas_atendidas').trim().notEmpty().withMessage('As comarcas atendidas são obrigatórias.'),
    body('tipo').isIn(['Advogado', 'Preposto']).withMessage("O tipo deve ser 'Advogado' ou 'Preposto'."),
    // Validação condicional: se o tipo for 'Advogado', o OAB é obrigatório.
    body('oab').if(body('tipo').equals('Advogado')).trim().notEmpty().withMessage('O número da OAB é obrigatório para advogados.'),
    body('senha').if(body('senha').exists()).isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
];

/**
 * Regras de validação para a criação de Demandas.
 */
const demandaRules = () => [
    body('titulo').trim().notEmpty().withMessage('O título da demanda é obrigatório.'),
    body('descricao_completa').trim().notEmpty().withMessage('A descrição completa é obrigatória.'),
    body('valor_proposto_cliente').isNumeric().withMessage('O valor proposto deve ser um número.'),
    body('prazo_fatal').optional({ checkFalsy: true }).isISO8601().withMessage('A data do prazo deve estar no formato AAAA-MM-DD.'),
];


module.exports = {
  validate,
  clienteRules,
  correspondenteRules,
  demandaRules,
};
