// Carrega as variáveis de ambiente do arquivo .env no início de tudo
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---

// Configuração do CORS para permitir requisições apenas da origem definida no .env
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
};
app.use(cors(corsOptions));

// Faz o parse de requisições com corpo no formato JSON
app.use(bodyParser.json());
// Faz o parse de requisições com corpo no formato urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// --- Rotas da API ---
// Importa todos os módulos de rotas da nossa aplicação
const authRoutes = require('./routes/auth.routes');
const demandaRoutes = require('./routes/demanda.routes');
const userRoutes = require('./routes/user.routes');

// Define os prefixos para cada conjunto de rotas
app.use('/api/auth', authRoutes);
app.use('/api/demandas', demandaRoutes);
app.use('/api/users', userRoutes); // Rotas para gestão de utilizadores


// Rota de teste para verificar se o servidor está no ar
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Sistema de Gestão de Diligências!' });
});


// --- Função de Inicialização do Servidor ---
const startServer = async () => {
  try {
    // 1. Testa a conexão com o banco de dados.
    await testConnection();
    
    // 2. Se a conexão for bem-sucedida, inicia o servidor Express.
    app.listen(PORT, () => {
      console.log(`✅ Servidor escutando na porta ${PORT}`);
    });
  } catch (error) {
    // Se a conexão com o banco falhar, o processo será encerrado pela função testConnection.
    // Este log é uma segurança extra.
    console.error('❌ Falha ao iniciar o servidor:', error);
    process.exit(1);
  }
};

// Inicia a aplicação
startServer();
