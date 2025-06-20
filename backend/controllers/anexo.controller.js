/**
 * controllers/anexo.controller.js
 * Controlador para gerir o upload e a listagem de anexos de uma demanda.
 */
const anexoRepository = require('../repositories/anexo.repository');
const logService = require('../services/log.service');
const catchAsync = require('../utils/catchAsync');

/**
 * Processa o upload de um ficheiro e associa-o a uma demanda.
 */
exports.uploadAnexo = catchAsync(async (req, res, next) => {
    // Se o multer processou o ficheiro, os detalhes estarão em req.file
    if (!req.file) {
        const err = new Error('Nenhum ficheiro enviado ou o tipo de ficheiro é inválido.');
        err.statusCode = 400;
        return next(err);
    }

    const { id: demanda_id } = req.params;
    const { user } = req;
    const { originalname, path, mimetype, size } = req.file;

    const dadosAnexo = {
        demanda_id,
        uploader_id: user.id,
        uploader_perfil: user.perfil,
        nome_original: originalname,
        path_armazenamento: path,
        tipo_mime: mimetype,
        tamanho_bytes: size,
    };

    // Guarda os metadados do ficheiro na base de dados
    const novoAnexo = await anexoRepository.create(dadosAnexo);

    // Regista a atividade de upload no log
    await logService.createLog(demanda_id, user, 'UPLOAD_ANEXO', {
        ficheiro: originalname,
        anexo_id: novoAnexo.id
    });

    res.status(201).json({
        message: 'Ficheiro enviado com sucesso!',
        anexo: novoAnexo
    });
});

/**
 * Lista todos os anexos de uma demanda.
 */
exports.getAnexosByDemanda = catchAsync(async (req, res, next) => {
    const { id: demanda_id } = req.params;
    // A verificação de permissão para ver a demanda já é feita na rota principal da demanda.
    // Aqui, podemos assumir que se o utilizador pode ver a demanda, pode ver os anexos.
    const anexos = await anexoRepository.findByDemandaId(demanda_id);
    res.status(200).json(anexos);
});
