/**
 * repositories/correspondente.repository.js
 * Repositório para gerir as operações CRUD da tabela 'correspondentes_servicos'.
 */
const db = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Cria um novo correspondente na base de dados.
 * @param {object} dados - Dados do correspondente a ser criado.
 * @returns {Promise<object>} O correspondente recém-criado (sem a senha).
 */
exports.create = async (dados) => {
    const { 
        nome_completo, tipo, oab, rg, cpf, email, telefone, 
        endereco_id, comarcas_atendidas, senha 
    } = dados;
    
    const senha_hash = await bcrypt.hash(senha, 10);

    const query = `
        INSERT INTO correspondentes_servicos (
            nome_completo, tipo, oab, rg, cpf, email, telefone, 
            endereco_id, comarcas_atendidas, senha_hash
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, nome_completo, tipo, email, is_active, created_at;
    `;
    const values = [
        nome_completo, tipo, oab, rg, cpf, email, telefone, 
        endereco_id, comarcas_atendidas, senha_hash
    ];
    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Busca todos os correspondentes.
 * @returns {Promise<Array>} Uma lista de todos os correspondentes.
 */
exports.findAll = async () => {
    const query = 'SELECT id, nome_completo, tipo, email, telefone, comarcas_atendidas, is_active FROM correspondentes_servicos ORDER BY nome_completo ASC;';
    const result = await db.query(query);
    return result.rows;
};

/**
 * Busca um correspondente específico pelo seu ID.
 * @param {number} id - O ID do correspondente.
 * @returns {Promise<object|null>} O objeto do correspondente ou null se não for encontrado.
 */
exports.findById = async (id) => {
    const query = `
        SELECT id, nome_completo, tipo, oab, rg, cpf, email, telefone, 
               endereco_id, comarcas_atendidas, is_active 
        FROM correspondentes_servicos WHERE id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

/**
 * Atualiza os dados de um correspondente.
 * @param {number} id - O ID do correspondente a ser atualizado.
 * @param {object} dados - Os novos dados do correspondente.
 * @returns {Promise<object>} O correspondente atualizado.
 */
exports.update = async (id, dados) => {
    const { 
        nome_completo, tipo, oab, rg, cpf, email, telefone, 
        endereco_id, comarcas_atendidas
    } = dados;
    const query = `
        UPDATE correspondentes_servicos
        SET nome_completo = $1, tipo = $2, oab = $3, rg = $4, cpf = $5, email = $6, 
            telefone = $7, endereco_id = $8, comarcas_atendidas = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING id, nome_completo, email, is_active;
    `;
    const values = [
        nome_completo, tipo, oab, rg, cpf, email, telefone, 
        endereco_id, comarcas_atendidas, id
    ];
    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Ativa ou desativa um correspondente.
 * @param {number} id - O ID do correspondente.
 * @param {boolean} is_active - O novo status.
 * @returns {Promise<object>} O correspondente com o status atualizado.
 */
exports.updateStatus = async (id, is_active) => {
    const query = 'UPDATE correspondentes_servicos SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, nome_completo, is_active;';
    const result = await db.query(query, [is_active, id]);
    return result.rows[0];
};
