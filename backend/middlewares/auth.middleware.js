/**
 * middlewares/auth.middleware.js
 * Middleware para verificar tokens JWT e autorizar perfis de utilizador.
 */
const jwt = require("jsonwebtoken");
require('dotenv').config();

/**
 * Verifica a validade do token JWT.
 */
const verifyToken = (req, res, next) => {
    let header = req.headers["authorization"];
    if (!header) {
        return res.status(403).send({ message: "Nenhum token fornecido!" });
    }

    const token = header.split(' ')[1];
    if (!token) {
        return res.status(403).send({ message: "Token mal formatado!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Não autorizado! Token inválido ou expirado." });
        }
        req.user = decoded; 
        next();
    });
};

/**
 * Middleware de autorização baseado em perfis.
 * @param {...string} allowedProfiles - Os perfis permitidos para aceder à rota (ex: 'admin', 'cliente').
 */
const authorize = (...allowedProfiles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.perfil) {
            return res.status(403).send({ message: "Acesso negado. Perfil não encontrado." });
        }

        const { perfil } = req.user;
        if (allowedProfiles.includes(perfil)) {
            return next(); // O utilizador tem permissão, continua.
        }

        return res.status(403).send({ message: "Acesso negado. Não tem permissão para realizar esta ação." });
    };
};

module.exports = { 
    verifyToken,
    authorize 
};
