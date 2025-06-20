/**
 * utils/catchAsync.js
 * Uma função utilitária que envolve funções de rota assíncronas.
 * Garante que qualquer erro lançado em uma promessa seja capturado
 * e passado para o próximo middleware de tratamento de erros (next).
 */
const catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
