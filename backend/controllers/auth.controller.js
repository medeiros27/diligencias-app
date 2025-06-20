/**
 * controllers/auth.controller.js
 * Controlador responsável pela lógica de autenticação (login) para múltiplos perfis.
 */
const authRepository = require("../repositories/auth.repository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const catchAsync = require('../utils/catchAsync');

exports.signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Utiliza o novo repositório para encontrar o utilizador em qualquer uma das tabelas de perfil
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
        const err = new Error("Credenciais inválidas. Verifique o email e a senha.");
        err.statusCode = 401; // Unauthorized
        return next(err);
    }

    // Compara a senha fornecida com a senha "hasheada" do banco de dados
    const passwordIsValid = bcrypt.compareSync(password, user.senha_hash);

    if (!passwordIsValid) {
        const err = new Error("Credenciais inválidas. Verifique o email e a senha.");
        err.statusCode = 401; // Unauthorized
        return next(err);
    }
    
    // Se as credenciais estiverem corretas, cria o token JWT
    const token = jwt.sign(
        { id: user.id, perfil: user.perfil }, 
        process.env.JWT_SECRET, 
        { expiresIn: 86400 } // Expira em 24 horas
    );

    res.status(200).send({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        accessToken: token
    });
});
