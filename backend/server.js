/**
 * server.js
 * Ponto de entrada principal da aplicação, agora com segurança reforçada.
 */
require('dotenv').config(); 

const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // Importa o helmet para segurança
const path = require('path');
const app = express();
const db = require('./db');

// === MIDDLEWARES ESSENCIAIS ===
app.use(helmet()); // Utiliza o helmet para adicionar cabeçalhos de segurança
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Serve ficheiros estáticos da pasta 'uploads' (para aceder aos anexos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === ROTAS DA APLICAÇÃO ===
// As rotas foram atualizadas para refletir a nova estrutura (clientes, correspondentes)
const authRoutes = require('./routes/auth.routes');
const clienteRoutes = require('./routes/cliente.routes');
const correspondenteRoutes = require('./routes/correspondente.routes');
const demandaRoutes = require('./routes/demanda.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Associa as rotas aos seus respectivos endpoints base
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/correspondentes', correspondenteRoutes);
app.use('/api/demandas', demandaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota raiz para teste
app.get("/", (req, res) => {
  res.json({ message: "Bem-vindo à API JurisConnect." });
});

// === MIDDLEWARE DE ERROS ===
// Deve ser o último middleware a ser adicionado.
const errorHandler = require('./middlewares/error.middleware');
app.use(errorHandler);

// Define a porta e inicia o servidor
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  await db.testConnection(); // Testa a conexão com o banco de dados antes de iniciar
  app.listen(PORT, () => {
    console.log(`Servidor está a rodar na porta ${PORT}.`);
  });
};

startServer();
