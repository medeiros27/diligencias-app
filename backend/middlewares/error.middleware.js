/**
 * middlewares/error.middleware.js
 * Middleware centralizado para tratamento de erros.
 * Ele é acionado sempre que a função `next()` é chamada com um argumento.
 * Loga o erro e envia uma resposta JSON padronizada para o cliente.
 */
const errorHandler = (err, req, res, next) => {
    // Loga o stack do erro no console para fins de depuração
    console.error(err.stack);

    // Define um status code padrão de 500 se nenhum for especificado no erro
    const statusCode = err.statusCode || 500;
    
    // Define uma mensagem de erro padrão
    const message = err.message || "Ocorreu um erro interno no servidor.";

    // Envia a resposta de erro formatada
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
    });
};

module.exports = errorHandler;
