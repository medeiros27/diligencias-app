/**
 * controllers/correspondente.controller.js
 * Controlador para a gestão de correspondentes por parte do administrador.
 */
const correspondenteRepository = require('../repositories/correspondente.repository');
const catchAsync = require('../utils/catchAsync');

exports.createCorrespondente = catchAsync(async (req, res, next) => {
    const novoCorrespondente = await correspondenteRepository.create(req.body);
    res.status(201).json({
        message: "Correspondente criado com sucesso!",
        correspondente: novoCorrespondente
    });
});

exports.getAllCorrespondentes = catchAsync(async (req, res, next) => {
    const correspondentes = await correspondenteRepository.findAll();
    res.status(200).json(correspondentes);
});

exports.getCorrespondenteById = catchAsync(async (req, res, next) => {
    const correspondente = await correspondenteRepository.findById(req.params.id);
    if (!correspondente) {
        const err = new Error('Correspondente não encontrado.');
        err.statusCode = 404;
        return next(err);
    }
    res.status(200).json(correspondente);
});

exports.updateCorrespondente = catchAsync(async (req, res, next) => {
    const correspondenteAtualizado = await correspondenteRepository.update(req.params.id, req.body);
    if (!correspondenteAtualizado) {
        const err = new Error('Correspondente não encontrado para atualização.');
        err.statusCode = 404;
        return next(err);
    }
    res.status(200).json({
        message: "Correspondente atualizado com sucesso!",
        correspondente: correspondenteAtualizado
    });
});

exports.updateCorrespondenteStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
        const err = new Error('O campo "is_active" é obrigatório e deve ser um booleano (true/false).');
        err.statusCode = 400;
        return next(err);
    }

    const correspondente = await correspondenteRepository.updateStatus(id, is_active);
     if (!correspondente) {
        const err = new Error('Correspondente não encontrado para atualização de status.');
        err.statusCode = 404;
        return next(err);
    }
    res.status(200).json({ message: `Status do correspondente atualizado com sucesso.` });
});
