/**
 * jest.config.js
 * Ficheiro de configuração para o Jest.
 */
module.exports = {
    /**
     * Esta opção diz ao Jest para carregar o módulo 'dotenv/config'
     * antes de executar qualquer código de teste.
     * O 'dotenv/config' irá procurar automaticamente um ficheiro .env
     * (e o Jest, ao correr com NODE_ENV=test, dará prioridade ao .env.test se existir)
     * e carregar as suas variáveis para o process.env da aplicação.
     * Isto garante que process.env.DATABASE_URL tenha o valor correto durante os testes.
     */
    setupFiles: ["dotenv/config"],

    // Força o Jest a parar de executar os testes após a primeira falha.
    // Útil para não sobrecarregar o log com erros repetidos. (Opcional)
    bail: true,

    // Indica ao Jest para procurar os testes apenas na pasta 'tests'. (Opcional)
    roots: ["<rootDir>/tests"],
};
