// repositories/cliente.repository.js

const { pool } = require('../db');

/**
 * Cria um novo cliente no banco de dados.
 * @param {object} clienteData - Os dados do cliente a serem criados.
 * @param {string} clienteData.nome_completo
 * @param {string} [clienteData.escritorio] - Opcional.
 * @param {string} clienteData.telefone
 * @param {string} clienteData.email
 * @param {string} clienteData.senha_hash
 * @returns {Promise<object>} Retorna o objeto do cliente recém-criado.
 */
const create = async ({ nome_completo, escritorio, telefone, email, senha_hash }) => {
  try {
    const result = await pool.query(
      `INSERT INTO clientes (nome_completo, escritorio, telefone, email, senha_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome_completo, email, created_at`,
      [nome_completo, escritorio, telefone, email, senha_hash]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Erro ao criar cliente (${email}):`, error);
    throw error;
  }
};

/**
 * Busca um cliente pelo seu endereço de email.
 * @param {string} email - O email do cliente.
 * @returns {Promise<object|null>} Retorna o objeto completo do cliente (incluindo senha) se encontrado.
 */
const findByEmail = async (email) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clientes WHERE email = $1', // Removido o filtro is_active para permitir login de contas inativas se necessário no futuro
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar cliente por email (${email}):`, error);
    throw error;
  }
};

/**
 * Busca um cliente pelo seu ID.
 * @param {number} id - O ID do cliente.
 * @returns {Promise<object|null>} Retorna o objeto do cliente (excluindo a senha) se encontrado.
 */
const findById = async (id) => {
  try {
    const result = await pool.query(
      'SELECT id, nome_completo, escritorio, telefone, email, is_active, created_at FROM clientes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar cliente por ID (${id}):`, error);
    throw error;
  }
};

/**
 * Lista todos os clientes (para Admins).
 * @returns {Promise<Array>} Retorna uma lista de todos os clientes.
 */
const findAll = async () => {
    try {
        const result = await pool.query(
            'SELECT id, nome_completo, escritorio, email, is_active, created_at FROM clientes ORDER BY nome_completo ASC'
        );
        return result.rows;
    } catch (error) {
        console.error('Erro ao listar todos os clientes:', error);
        throw error;
    }
};

/**
 * Atualiza o status de um cliente (ativo/inativo).
 * @param {number} id - O ID do cliente.
 * @param {boolean} isActive - O novo status.
 * @returns {Promise<object|null>} Retorna o cliente atualizado.
 */
const updateActiveStatus = async (id, isActive) => {
    try {
        const result = await pool.query(
            'UPDATE clientes SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nome_completo, is_active',
            [isActive, id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Erro ao atualizar status do cliente (${id}):`, error);
        throw error;
    }
};

module.exports = {
  create,
  findByEmail,
  findById,
  findAll,
  updateActiveStatus,
};