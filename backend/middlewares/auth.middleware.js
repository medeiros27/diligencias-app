// middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar o token JWT e proteger rotas.
 * Anexa os dados do utilizador (`payload`) ao objeto `req` se o token for válido.
 */
const protectRoute = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  // 1. Verificar se o cabeçalho de autorização existe e está no formato correto ("Bearer TOKEN")
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      // 2. Extrair o token do cabeçalho
      token = authHeader.split(' ')[1];

      // 3. Verificar e decodificar o token usando a chave secreta
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Anexar os dados do utilizador (payload) ao objeto da requisição
      // Agora, qualquer rota subsequente terá acesso a req.user
      req.user = decoded; 

      next(); // Continua para a próxima função (o controlador da rota)
    } catch (error) {
      // Se jwt.verify falhar (token inválido, expirado, etc.), retorna um erro.
      console.error('Erro de autenticação:', error.message);
      return res.status(401).json({ error: 'Não autorizado, token inválido.' });
    }
  }

  // Se não houver token no cabeçalho, retorna um erro.
  if (!token) {
    return res.status(401).json({ error: 'Não autorizado, nenhum token fornecido.' });
  }
};

/**
 * Middleware para verificar se o utilizador tem um perfil específico.
 * Deve ser usado DEPOIS do middleware protectRoute.
 * @param {...string} perfis - Lista de perfis permitidos (ex: 'admin', 'cliente')
 */
const authorize = (...perfis) => {
  return (req, res, next) => {
    // Verifica se o perfil do utilizador (adicionado por protectRoute) está na lista de perfis permitidos.
    if (!req.user || !perfis.includes(req.user.perfil)) {
      return res.status(403).json({ error: 'Acesso negado. Não tem permissão para realizar esta ação.' });
    }
    next();
  };
};


module.exports = {
  protectRoute,
  authorize,
};