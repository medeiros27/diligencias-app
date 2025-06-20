const demandaRepository = require('../repositories/demanda.repository.js');
const catchAsync = require('../utils/catchAsync');

/**
 * Cria uma nova diligência.
 * Apenas utilizadores com perfil 'cliente' podem criar.
 */
exports.createDemanda = catchAsync(async (req, res, next) => {
    // Apenas clientes podem criar. Poderíamos adicionar uma verificação de perfil aqui.
    if (req.user.perfil !== 'cliente') {
        const err = new Error('Apenas clientes podem criar diligências.');
        err.statusCode = 403; // Forbidden
        return next(err);
    }

    const cliente_id = req.user.id; // ID do cliente vem do token JWT
    const dadosDemanda = { ...req.body, cliente_id, status: 'aguardando_distribuicao', data_cadastro: new Date() };

    const novaDemanda = await demandaRepository.create(dadosDemanda);
    res.status(201).json(novaDemanda);
});

/**
 * Busca uma diligência específica pelo seu ID com regras de acesso.
 */
exports.getDemandaById = catchAsync(async (req, res, next) => {
    const demandaId = parseInt(req.params.id, 10);
    const { id: userId, perfil } = req.user;

    const demanda = await demandaRepository.findById(demandaId);

    if (!demanda) {
        const err = new Error('Diligência não encontrada.');
        err.statusCode = 404;
        return next(err);
    }

    // Verifica a permissão de acesso
    if (
        perfil !== 'admin' &&
        demanda.id_cliente !== userId &&
        demanda.id_correspondente !== userId
    ) {
        const err = new Error('Acesso negado. Você não tem permissão para ver esta diligência.');
        err.statusCode = 403;
        return next(err);
    }

    res.status(200).json(demanda);
});

/**
 * Lista as diligências para o utilizador logado com base no seu perfil.
 */
exports.getMinhasDemandas = catchAsync(async (req, res, next) => {
    const { id: userId, perfil } = req.user;
    let demandas;

    switch (perfil) {
        case 'admin':
            demandas = await demandaRepository.findAll();
            break;
        case 'cliente':
            demandas = await demandaRepository.findByClienteId(userId);
            break;
        case 'correspondente':
            demandas = await demandaRepository.findByCorrespondenteId(userId);
            break;
        default:
            const err = new Error('Perfil de utilizador inválido.');
            err.statusCode = 403;
            return next(err);
    }

    res.status(200).json(demandas);
});

/**
 * Atribui uma diligência a um correspondente (apenas 'admin').
 */
exports.assignDemanda = catchAsync(async (req, res, next) => {
    // Esta rota deve ser protegida para ser acessível apenas por administradores.
    // Isso pode ser feito na definição da rota ou aqui.
    if (req.user.perfil !== 'admin') {
         const err = new Error('Acesso negado. Apenas administradores podem atribuir diligências.');
        err.statusCode = 403;
        return next(err);
    }

    const demandaId = parseInt(req.params.id, 10);
    const { correspondenteId } = req.body;

    if (!correspondenteId) {
        const err = new Error('O ID do correspondente é obrigatório.');
        err.statusCode = 400; // Bad Request
        return next(err);
    }

    const demandaAtualizada = await demandaRepository.assignCorrespondente(demandaId, correspondenteId);

    if (!demandaAtualizada) {
        const err = new Error('Diligência não encontrada para atribuição.');
        err.statusCode = 404;
        return next(err);
    }
    
    // TODO: Futuramente, disparar uma notificação para o correspondente.

    res.status(200).json(demandaAtualizada);
});

/**
 * Atualiza o status de uma diligência.
 */
exports.updateDemandaStatus = catchAsync(async (req, res, next) => {
    const demandaId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const { id: userId, perfil } = req.user;

    if (!status) {
        const err = new Error('O novo status é obrigatório.');
        err.statusCode = 400;
        return next(err);
    }

    const demanda = await demandaRepository.findById(demandaId);
    if (!demanda) {
        const err = new Error('Diligência não encontrada.');
        err.statusCode = 404;
        return next(err);
    }

    if (perfil !== 'admin' && demanda.id_correspondente !== userId) {
        const err = new Error('Acesso negado. Apenas o administrador ou o correspondente responsável podem alterar o status.');
        err.statusCode = 403;
        return next(err);
    }
    
    const demandaAtualizada = await demandaRepository.updateStatus(demandaId, status);
    
    // TODO: Futuramente, disparar uma notificação para o cliente.
    
    res.status(200).json(demandaAtualizada);
});
/**
 * repositories/demanda.repository.js
 * Repositório para interagir com a tabela 'demandas' de acordo com o novo esquema.
 */
const db = require('../db');

/**
 * Cria uma nova demanda no banco de dados.
 * @param {object} dadosDemanda - Os dados da demanda a serem inseridos.
 * @returns {Promise<object>} A demanda recém-criada.
 */
exports.create = async (dadosDemanda) => {
    const {
        titulo, descricao_completa, numero_processo, tipo_demanda, prazo_fatal,
        valor_proposto_cliente, cliente_id, admin_responsavel_id
    } = dadosDemanda;

    const query = `
        INSERT INTO demandas (
            titulo, descricao_completa, numero_processo, tipo_demanda, prazo_fatal,
            valor_proposto_cliente, cliente_id, admin_responsavel_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pendente')
        RETURNING *;`;
    
    const values = [
        titulo, descricao_completa, numero_processo, tipo_demanda, prazo_fatal,
        valor_proposto_cliente, cliente_id, admin_responsavel_id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Busca uma demanda pelo seu ID, juntando informações do cliente e correspondente.
 * @param {number} id - O ID da demanda.
 * @returns {Promise<object|null>} O objeto da demanda ou null.
 */
exports.findById = async (id) => {
    const query = `
        SELECT 
            d.*,
            c.nome_completo AS nome_cliente,
            cs.nome_completo AS nome_correspondente
        FROM demandas d
        JOIN clientes c ON d.cliente_id = c.id
        LEFT JOIN correspondentes_servicos cs ON d.correspondente_id = cs.id
        WHERE d.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// Adicione aqui outras funções de busca que você precisar, como:
// exports.findAll, exports.findByClienteId, exports.findByCorrespondenteId
// Todas precisarão ser atualizadas para o novo esquema.
