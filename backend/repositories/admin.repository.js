// repositories/admin.repository.js

const { pool } = require('../db');

/**
 * Busca um administrador pelo seu endereço de email.
 * @param {string} email - O email do administrador a ser encontrado.
 * @returns {Promise<object|null>} Retorna o objeto do administrador se encontrado, senão null.
 */
const findByEmail = async (email) => {
  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );
    // Retorna a primeira linha encontrada ou null se não houver resultados.
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar admin por email (${email}):`, error);
    // Lança o erro para ser tratado pela camada de serviço/controlador.
    throw error;
  }
};

/**
 * Busca um administrador pelo seu ID.
 * @param {number} id - O ID do administrador.
 * @returns {Promise<object|null>} Retorna o objeto do administrador se encontrado, senão null.
 */
const findById = async (id) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, is_active, last_login, created_at FROM admins WHERE id = $1',
      [id]
    );
    // Retorna a primeira linha, excluindo o hash da senha por segurança.
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar admin por ID (${id}):`, error);
    throw error;
  }
};

// Futuramente, podemos adicionar outras funções aqui, como:
// create, update, delete, etc.

module.exports = {
  findByEmail,
  findById,
};
