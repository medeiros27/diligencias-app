// controllers/auth.controller.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminRepository = require('../repositories/admin.repository');
const clienteRepository = require('../repositories/cliente.repository');
const correspondenteRepository = require('../repositories/correspondente.repository');

/**
 * Regista um novo cliente no sistema.
 */
const registerCliente = async (req, res) => {
  const { nome_completo, escritorio, telefone, email, senha } = req.body;

  try {
    // 1. Verificar se o email já existe
    const clienteExistente = await clienteRepository.findByEmail(email);
    if (clienteExistente) {
      return res.status(409).json({ error: 'Este endereço de email já está a ser utilizado.' });
    }

    // 2. Fazer o hash da palavra-passe
    const senha_hash = await bcrypt.hash(senha, 10);

    // 3. Criar o novo cliente
    const novoCliente = await clienteRepository.create({
      nome_completo,
      escritorio,
      telefone,
      email,
      senha_hash,
    });

    res.status(201).json({
      message: 'Cliente registado com sucesso!',
      cliente: novoCliente,
    });
  } catch (error) {
    console.error('Erro no registo do cliente:', error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado ao registar o cliente.' });
  }
};

/**
 * Regista um novo correspondente no sistema.
 */
const registerCorrespondente = async (req, res) => {
    const { nome_completo, tipo, oab, rg, cpf, email, telefone, comarcas_atendidas, senha } = req.body;
  
    try {
      // 1. Verificar se email ou CPF já existem
      if (await correspondenteRepository.findByEmail(email)) {
        return res.status(409).json({ error: 'Este endereço de email já está a ser utilizado.' });
      }
      if (await correspondenteRepository.findByCpf(cpf)) {
        return res.status(409).json({ error: 'Este CPF já está a ser utilizado.' });
      }
  
      // 2. Fazer o hash da palavra-passe
      const senha_hash = await bcrypt.hash(senha, 10);
  
      // 3. Criar o novo correspondente
      const novoCorrespondente = await correspondenteRepository.create({
        nome_completo, tipo, oab, rg, cpf, email, telefone, 
        comarcas_atendidas, senha_hash
      });
  
      res.status(201).json({
        message: 'Correspondente registado com sucesso!',
        correspondente: novoCorrespondente
      });
    } catch (error) {
        console.error('Erro no registo do correspondente:', error);
        res.status(500).json({ error: 'Ocorreu um erro inesperado ao registar o correspondente.' });
    }
  };

/**
 * Realiza o login unificado para todos os perfis de utilizador.
 */
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    // 1. Procurar o utilizador em todas as tabelas de perfil
    let user = null;
    let perfil = null;

    user = await adminRepository.findByEmail(email);
    if (user) {
      perfil = 'admin';
    } else {
      user = await clienteRepository.findByEmail(email);
      if (user) {
        perfil = 'cliente';
      } else {
        user = await correspondenteRepository.findByEmail(email);
        if (user) {
          perfil = 'correspondente';
        }
      }
    }
    
    // 2. Se nenhum utilizador for encontrado, ou a palavra-passe estiver incorreta, retornar erro.
    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res.status(401).json({ error: 'Email ou palavra-passe inválidos.' });
    }

    // 3. Gerar o Token JWT
    const payload = {
      userId: user.id,
      email: user.email,
      perfil: perfil,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 4. Enviar a resposta com os dados do utilizador (sem a palavra-passe) e o token.
    const { senha_hash, ...userData } = user;
    res.status(200).json({
      message: 'Login bem-sucedido!',
      user: userData,
      token: token
    });

  } catch (error) {
    console.error('Erro no processo de login:', error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado durante o login.' });
  }
};


module.exports = {
  registerCliente,
  registerCorrespondente,
  login,
};
