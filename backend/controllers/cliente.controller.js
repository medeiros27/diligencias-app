/**
 * controllers/cliente.controller.js
 * Controlador para a gestão de clientes por parte do administrador.
 */
const clienteRepository = require('../repositories/cliente.repository');
const catchAsync = require('../utils/catchAsync');

exports.createCliente = catchAsync(async (req, res, next) => {
    const novoCliente = await clienteRepository.create(req.body);
    res.status(201).json({
        message: "Cliente criado com sucesso!",
        cliente: novoCliente
    });
});

exports.getAllClientes = catchAsync(async (req, res, next) => {
    const clientes = await clienteRepository.findAll();
    res.status(200).json(clientes);
});

exports.getClienteById = catchAsync(async (req, res, next) => {
    const cliente = await clienteRepository.findById(req.params.id);
    if (!cliente) {
        const err = new Error('Cliente não encontrado.');
        err.statusCode = 404;
        return next(err);
    }
    res.status(200).json(cliente);
});

exports.updateCliente = catchAsync(async (req, res, next) => {
    const clienteAtualizado = await clienteRepository.update(req.params.id, req.body);
    if (!clienteAtualizado) {
        const err = new Error('Cliente não encontrado para atualização.');
        err.statusCode = 404;
        return next(err);
    }
    res.status(200).json({
        message: "Cliente atualizado com sucesso!",
        cliente: clienteAtualizado
    });
});

exports.updateClienteStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
        const err = new Error('O campo "is_active" é obrigatório e deve ser um booleano (true/false).');
        err.statusCode = 400;
        return next(err);
    }

    const cliente = await clienteRepository.updateStatus(id, is_active);
     if (!cliente) {
        const err = new Error('Cliente não encontrado para atualização de status.');
        err.statusCode = 404;
        return next(err);
    }
    res.status(200).json({ message: `Status do cliente atualizado com sucesso.` });
});
