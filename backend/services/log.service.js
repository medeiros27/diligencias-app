/**
 * services/log.service.js
 * Serviço para gerir a lógica de negócio de registo de atividades.
 */
const logRepository = require('../repositories/log.repository');

/**
 * Orquestra a criação de um novo registo de log.
 * @param {number} demanda_id - ID da demanda relacionada.
 * @param {object} ator - O objeto do utilizador que realiza a ação (req.user).
 * @param {string} tipo_log - O tipo de log (ex: 'ATUALIZACAO', 'MUDANCA_STATUS').
 * @param {object} detalhes - Um objeto JSON com os detalhes da ação.
 */
exports.createLog = async (demanda_id, ator, tipo_log, detalhes) => {
    try {
        const dadosLog = {
            demanda_id,
            ator_id: ator.id,
            ator_perfil: ator.perfil,
            tipo_log,
            detalhes,
        };
        await logRepository.create(dadosLog);
    } catch (error) {
        // Logamos o erro no console, mas não impedimos a operação principal de continuar.
        // O registo de logs é importante, mas não deve quebrar a funcionalidade principal.
        console.error("Falha ao criar registo de atividade:", error);
    }
};
