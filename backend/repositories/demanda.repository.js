// repositories/demanda.repository.js

const { pool } = require('../db');

/**
 * Cria uma nova diligência no banco de dados.
 * @param {object} demandaData - Os dados da diligência.
 * @param {string} demandaData.titulo
 * @param {string} demandaData.descricao_completa
 * @param {number} demandaData.cliente_id - ID do cliente que está a criar a demanda.
 * @returns {Promise<object>} Retorna o objeto da diligência recém-criada.
 */
const create = async ({ titulo, descricao_completa, numero_processo, tipo_demanda, prazo_fatal, valor_proposto_cliente, cliente_id }) => {
  try {
    const result = await pool.query(
      `INSERT INTO demandas (titulo, descricao_completa, numero_processo, tipo_demanda, prazo_fatal, valor_proposto_cliente, cliente_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [titulo, descricao_completa, numero_processo, tipo_demanda, prazo_fatal, valor_proposto_cliente, cliente_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Erro ao criar diligência:`, error);
    throw error;
  }
};

/**
 * Busca uma diligência pelo seu ID.
 * @param {number} id - O ID da diligência.
 * @returns {Promise<object|null>} Retorna o objeto da diligência com detalhes do cliente e correspondente.
 */
const findById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT 
         d.*,
         c.nome_completo as nome_cliente,
         c.email as email_cliente,
         cs.nome_completo as nome_correspondente,
         cs.email as email_correspondente
       FROM demandas d
       JOIN clientes c ON d.cliente_id = c.id
       LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
       WHERE d.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Erro ao buscar diligência por ID (${id}):`, error);
    throw error;
  }
};

/**
 * Lista todas as diligências (para Admins).
 * @returns {Promise<Array>} Retorna uma lista de todas as diligências.
 */
const findAll = async () => {
    try {
      const result = await pool.query(
        `SELECT 
           d.id, d.titulo, d.status, d.prazo_fatal,
           c.nome_completo as nome_cliente,
           cs.nome_completo as nome_correspondente
         FROM demandas d
         JOIN clientes c ON d.cliente_id = c.id
         LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
         ORDER BY d.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      console.error(`Erro ao listar todas as diligências:`, error);
      throw error;
    }
  };

/**
 * Lista as diligências de um cliente específico.
 * @param {number} clienteId - O ID do cliente.
 * @returns {Promise<Array>} Retorna a lista de diligências do cliente.
 */
const findByClienteId = async (clienteId) => {
    try {
        const result = await pool.query(
          `SELECT d.*, cs.nome_completo as nome_correspondente 
           FROM demandas d
           LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
           WHERE d.cliente_id = $1 
           ORDER BY d.created_at DESC`,
          [clienteId]
        );
        return result.rows;
      } catch (error) {
        console.error(`Erro ao listar diligências para o cliente (${clienteId}):`, error);
        throw error;
      }
};

/**
 * Lista as diligências de um correspondente específico.
 * @param {number} correspondenteId - O ID do correspondente.
 * @returns {Promise<Array>} Retorna a lista de diligências do correspondente.
 */
const findByCorrespondenteId = async (correspondenteId) => {
    try {
        const result = await pool.query(
          `SELECT d.*, c.nome_completo as nome_cliente 
           FROM demandas d
           JOIN clientes c ON d.cliente_id = c.id
           WHERE d.correspondente_id = $1 
           ORDER BY d.created_at DESC`,
          [correspondenteId]
        );
        return result.rows;
      } catch (error) {
        console.error(`Erro ao listar diligências para o correspondente (${correspondenteId}):`, error);
        throw error;
      }
};

/**
 * Atribui uma diligência a um correspondente.
 * @param {number} demandaId - O ID da diligência.
 * @param {number} correspondenteId - O ID do correspondente.
 * @returns {Promise<object>} Retorna a diligência atualizada.
 */
const assignCorrespondente = async (demandaId, correspondenteId) => {
  try {
    const result = await pool.query(
      `UPDATE demandas 
       SET correspondente_id = $1, status = 'Em Andamento', updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [correspondenteId, demandaId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Erro ao atribuir correspondente à diligência (${demandaId}):`, error);
    throw error;
  }
};

/**
 * Atualiza o status de uma diligência.
 * @param {number} demandaId - O ID da diligência.
 * @param {string} status - O novo status (deve ser um valor do ENUM STATUS_DILIGENCIA).
 * @returns {Promise<object>} Retorna a diligência atualizada.
 */
const updateStatus = async (demandaId, status) => {
  try {
    const result = await pool.query(
      `UPDATE demandas 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, demandaId]
    );
    return result.rows[0];
  } catch (error) {
    console.error(`Erro ao atualizar status da diligência (${demandaId}):`, error);
    throw error;
  }
};


module.exports = {
  create,
  findById,
  findAll,
  findByClienteId,
  findByCorrespondenteId,
  assignCorrespondente,
  updateStatus,
};