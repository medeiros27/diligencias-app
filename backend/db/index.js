// db/index.js

const { Pool } = require('pg');

// A configuração da pool agora lê diretamente a DATABASE_URL do .env.
// Isso torna a configuração mais limpa e portável entre ambientes.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Em produção, pode ser necessário adicionar configurações de SSL:
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

// Função para testar a conexão com o banco de dados ao iniciar o servidor.
const testConnection = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('🚀 Conexão com o banco de dados estabelecida com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco de dados:', err.stack);
    // Em caso de falha na conexão, encerramos o processo para evitar erros inesperados na aplicação.
    process.exit(1);
  }
};

// Exportamos a pool para ser usada pelos repositórios e a função de teste.
// A partir de agora, em vez de um 'db.query', usaremos 'pool.query'.
module.exports = {
  pool,
  testConnection,
};
