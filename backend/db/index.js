/**
 * db/index.js
 * Configura o pool de conexão com o banco de dados PostgreSQL.
 * Utiliza uma connection string (DATABASE_URL) para portabilidade e
 * exporta métodos para queries, transações e teste de conexão.
 */
const { Pool } = require('pg');
require('dotenv').config(); // Carrega as variáveis do arquivo .env

// A configuração do pool lê a DATABASE_URL do .env.
// Isso torna a configuração mais limpa e portável entre ambientes.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Em produção, pode ser necessário adicionar configurações de SSL:
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

/**
 * Testa a conexão com o banco de dados.
 * É uma boa prática chamar esta função na inicialização do servidor.
 */
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect(); // Pega um cliente para testar
    await client.query('SELECT NOW()'); // Executa uma query simples
    console.log('🚀 Conexão com o banco de dados estabelecida com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.stack);
    // Em caso de falha, encerra o processo para evitar erros na aplicação.
    process.exit(1);
  } finally {
    if (client) {
      client.release(); // Libera o cliente de volta para o pool
    }
  }
};

module.exports = {
  // Método para executar queries simples diretamente do pool.
  // Mantém a compatibilidade com o restante do código refatorado.
  query: (text, params) => pool.query(text, params),
  
  // Método para obter um cliente do pool.
  // Essencial para executar transações (BEGIN, COMMIT, ROLLBACK).
  getClient: () => pool.connect(),

  // Exporta a função de teste de conexão para ser usada no server.js.
  testConnection
};
