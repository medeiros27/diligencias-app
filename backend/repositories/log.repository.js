/**
 * repositories/log.repository.js
 * Repositório para gerir as operações na tabela 'log_atividades'.
 */
const db = require('../db');

/**
 * Cria um novo registo de atividade na base de dados.
 * @param {object} dadosLog - Os dados do log a serem inseridos.
 * @returns {Promise<object>} O registo de log recém-criado.
 */
exports.create = async (dadosLog) => {
    const { demanda_id, ator_id, ator_perfil, tipo_log, detalhes } = dadosLog;

    const query = `
        INSERT INTO log_atividades (demanda_id, ator_id, ator_perfil, tipo_log, detalhes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    
    // O campo 'detalhes' é do tipo JSONB, por isso passamos o objeto diretamente.
    // O driver pg irá serializá-lo para JSON.
    const values = [demanda_id, ator_id, ator_perfil, tipo_log, detalhes];

    const result = await db.query(query, values);
    return result.rows[0];
};
