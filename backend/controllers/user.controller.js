/**
 * controllers/user.controller.js
 * Controlador para as operações de gestão de clientes e correspondentes por administradores.
 */
const clienteRepository = require("../repositories/cliente.repository");
const correspondenteRepository = require("../repositories/correspondente.repository");
const catchAsync = require('../utils/catchAsync');

const userController = {};

userController.listClientes = catchAsync(async (req, res, next) => {
    // Supõe que o repositório tem um método findAll. Se o nome for outro (ex: getClientes), ajuste aqui.
    const clientes = await clienteRepository.findAll();
    res.status(200).json(clientes);
});

userController.listCorrespondentes = catchAsync(async (req, res, next) => {
    // Supõe que o repositório tem um método findAll. Se o nome for outro, ajuste aqui.
    const correspondentes = await correspondenteRepository.findAll();
    res.status(200).json(correspondentes);
});

userController.updateClienteStatus = catchAsync(async (req, res, next) => {
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
    res.status(200).send({ message: `Status do cliente ${id} atualizado com sucesso.` });
});

userController.updateCorrespondenteStatus = catchAsync(async (req, res, next) => {
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
    res.status(200).send({ message: `Status do correspondente ${id} atualizado com sucesso.` });
});

// Exporta o objeto do controlador no final, garantindo que tudo está incluído.
module.exports = userController;
