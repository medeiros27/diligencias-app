/**
 * controllers/demanda.controller.js
 * Controlador com a lógica de negócio para gerenciar demandas, alinhado ao novo esquema.
 */
const demandaRepository = require('../repositories/demanda.repository');
const logService = require('../services/log.service');
const catchAsync = require('../utils/catchAsync');

const demandaController = {};

demandaController.createDemanda = catchAsync(async (req, res, next) => {
    const dadosDemanda = { ...req.body, cliente_id: req.user.id };
    const novaDemanda = await demandaRepository.create(dadosDemanda);
    await logService.createLog(novaDemanda.id, req.user, 'CRIACAO', { titulo: novaDemanda.titulo });
    res.status(201).json(novaDemanda);
});

demandaController.getDemandaById = catchAsync(async (req, res, next) => {
    const demanda = await demandaRepository.findById(req.params.id);
    if (!demanda) {
        const err = new Error('Demanda não encontrada.');
        err.statusCode = 404;
        return next(err);
    }
    res.status(200).json(demanda);
});

demandaController.getMinhasDemandas = catchAsync(async (req, res, next) => {
    const { id: userId, perfil } = req.user;
    let demandas;
    switch (perfil) {
        case 'admin': demandas = await demandaRepository.findAll(); break;
        case 'cliente': demandas = await demandaRepository.findByClienteId(userId); break;
        case 'correspondente': demandas = await demandaRepository.findByCorrespondenteId(userId); break;
        default:
            const err = new Error('Perfil de utilizador inválido.');
            err.statusCode = 403;
            return next(err);
    }
    res.status(200).json(demandas);
});

demandaController.assignDemanda = catchAsync(async (req, res, next) => {
    const demandaId = parseInt(req.params.id, 10);
    const { correspondenteId } = req.body;
    if (!correspondenteId) {
        const err = new Error('O ID do correspondente é obrigatório.');
        err.statusCode = 400;
        return next(err);
    }
    const demandaAtualizada = await demandaRepository.assignCorrespondente(demandaId, correspondenteId);
    if (!demandaAtualizada) {
        const err = new Error('Demanda não encontrada para atribuição.');
        err.statusCode = 404;
        return next(err);
    }
    await logService.createLog(demandaId, req.user, 'ATUALIZACAO', { acao: 'Atribuição', id_correspondente: correspondenteId });
    res.status(200).json(demandaAtualizada);
});

demandaController.updateDemandaStatus = catchAsync(async (req, res, next) => {
    const demandaId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const demandaAntes = await demandaRepository.findById(demandaId);
    if (!demandaAntes) {
        const err = new Error('Diligência não encontrada.');
        err.statusCode = 404;
        return next(err);
    }
    const demandaAtualizada = await demandaRepository.updateStatus(demandaId, status);
    await logService.createLog(demandaId, req.user, 'MUDANCA_STATUS', { de: demandaAntes.status, para: status });
    res.status(200).json(demandaAtualizada);
});

// Exporta o objeto do controlador no final.
module.exports = demandaController;
