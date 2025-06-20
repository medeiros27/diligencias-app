/**
 * repositories/anexo.repository.js
 * Repositório para gerir as operações na tabela 'anexos_demandas'.
 */
const db = require('../db');

/**
 * Cria um novo registo de anexo na base de dados.
 * @param {object} dadosAnexo - Os dados do anexo a serem inseridos.
 * @returns {Promise<object>} O registo do anexo recém-criado.
 */
exports.create = async (dadosAnexo) => {
    const { 
        demanda_id, uploader_id, uploader_perfil, nome_original, 
        path_armazenamento, tipo_mime, tamanho_bytes 
    } = dadosAnexo;

    const query = `
        INSERT INTO anexos_demandas (
            demanda_id, uploader_id, uploader_perfil, nome_original, 
            path_armazenamento, tipo_mime, tamanho_bytes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    
    const values = [
        demanda_id, uploader_id, uploader_perfil, nome_original, 
        path_armazenamento, tipo_mime, tamanho_bytes
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Busca todos os anexos de uma demanda específica.
 * @param {number} demanda_id - O ID da demanda.
 * @returns {Promise<Array>} Uma lista de anexos da demanda.
 */
exports.findByDemandaId = async (demanda_id) => {
    const query = 'SELECT * FROM anexos_demandas WHERE demanda_id = $1 ORDER BY created_at DESC;';
    const result = await db.query(query, [demanda_id]);
    return result.rows;
};
