// repositories/correspondente.repository.js

const { pool } = require('../db');

/**
 * Cria um novo correspondente de serviços no banco de dados.
 * @param {object} correspondenteData - Os dados do correspondente.
 * @returns {Promise<object>} Retorna o objeto do correspondente recém-criado.
 */
const create = async (correspondenteData) => {
  const {
    nome_completo, tipo, oab, rg, cpf, email, telefone,
    endereco_id, comarcas_atendidas, senha_hash
  } = correspondenteData;

  try {
    const result = await pool.query(
      `INSERT INTO correspondentes_servicos 
       (nome_completo, tipo, oab, rg, cpf, email, telefone, endereco_id, comarcas_atendidas, senha_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, nome_completo, email, tipo, created_at`,
      [nome_completo, tipo, oab, rg, cpf, email, telefone, endereco_id, comarcas_atendidas, senha_hash]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Erro ao criar correspondente (${email}):`, error);
    throw error;
  }
};

/**
 * Busca um correspondente pelo seu endereço de email.
 * @param {string} email - O email do correspondente.
 * @returns {Promise<object|null>} Retorna o objeto completo do correspondente (incluindo senha) se encontrado.
 */
const findByEmail = async (email) => {
  try {
    const result = await pool.query(
      'SELECT * FROM correspondentes_servicos WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar correspondente por email (${email}):`, error);
    throw error;
  }
};

/**
 * Busca um correspondente pelo seu CPF.
 * @param {string} cpf - O CPF do correspondente.
 * @returns {Promise<object|null>} Retorna o objeto do correspondente se encontrado.
 */
const findByCpf = async (cpf) => {
    try {
      const result = await pool.query(
        'SELECT * FROM correspondentes_servicos WHERE cpf = $1',
        [cpf]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Erro ao buscar correspondente por CPF (${cpf}):`, error);
      throw error;
    }
  };

/**
 * Busca um correspondente pelo seu ID.
 * @param {number} id - O ID do correspondente.
 * @returns {Promise<object|null>} Retorna o objeto do correspondente (excluindo a senha) se encontrado.
 */
const findById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT id, nome_completo, tipo, oab, rg, cpf, email, telefone, comarcas_atendidas, is_active, created_at 
       FROM correspondentes_servicos WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar correspondente por ID (${id}):`, error);
    throw error;
  }
};

/**
 * Lista todos os correspondentes (para Admins).
 * @returns {Promise<Array>} Retorna uma lista de todos os correspondentes.
 */
const findAll = async () => {
    try {
        const result = await pool.query(
            'SELECT id, nome_completo, tipo, oab, email, is_active, created_at FROM correspondentes_servicos ORDER BY nome_completo ASC'
        );
        return result.rows;
    } catch (error) {
        console.error('Erro ao listar todos os correspondentes:', error);
        throw error;
    }
};

/**
 * Atualiza o status de um correspondente (ativo/inativo).
 * @param {number} id - O ID do correspondente.
 * @param {boolean} isActive - O novo status.
 * @returns {Promise<object|null>} Retorna o correspondente atualizado.
 */
const updateActiveStatus = async (id, isActive) => {
    try {
        const result = await pool.query(
            'UPDATE correspondentes_servicos SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nome_completo, is_active',
            [isActive, id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error(`Erro ao atualizar status do correspondente (${id}):`, error);
        throw error;
    }
};

module.exports = {
  create,
  findByEmail,
  findByCpf,
  findById,
  findAll,
  updateActiveStatus,
};
