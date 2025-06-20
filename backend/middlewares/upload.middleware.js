/**
 * middlewares/upload.middleware.js
 * Configura o middleware 'multer' para a gestão de uploads de ficheiros.
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define o diretório onde os ficheiros serão guardados
const uploadDir = 'uploads/';

// Garante que o diretório de upload existe
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuração do armazenamento em disco
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Define a pasta de destino
    },
    filename: (req, file, cb) => {
        // Cria um nome de ficheiro único para evitar sobreposições
        // Formato: demanda-ID-timestamp-nomeoriginal.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `demanda-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

/**
 * Filtro para aceitar apenas certos tipos de ficheiros (opcional, mas recomendado).
 * Exemplo: aceitar apenas imagens e PDFs.
 */
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true); // Aceita o ficheiro
    } else {
        // Rejeita o ficheiro com uma mensagem de erro
        cb(new Error('Tipo de ficheiro inválido. Apenas imagens, PDFs e documentos Word são permitidos.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10 // Limite de 10MB por ficheiro
    }
});

module.exports = upload;
