// tests/auth.integration.test.js

// A LINHA CORRIGIDA: Carrega as variáveis de ambiente do ficheiro .env
// Isto garante que process.env.JWT_SECRET tenha um valor durante os testes.
require('dotenv').config();

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');

// Recriar uma instância do app para o teste.
const app = express();
app.use(bodyParser.json());

// Importar as rotas
const authRoutes = require('../routes/auth.routes');
const demandaRoutes = require('../routes/demanda.routes');

// Configurar o app de teste com as rotas
app.use('/api/auth', authRoutes);
app.use('/api/demandas', demandaRoutes);

// --- Mocks dos Repositórios ---
// Vamos simular o comportamento dos nossos repositórios para isolar os testes.
jest.mock('../repositories/cliente.repository');
jest.mock('../repositories/correspondente.repository');
jest.mock('../repositories/admin.repository');
jest.mock('../repositories/demanda.repository');

const clienteRepository = require('../repositories/cliente.repository');
const correspondenteRepository = require('../repositories/correspondente.repository');
const adminRepository = require('../repositories/admin.repository');
const demandaRepository = require('../repositories/demanda.repository');


// ----- Início dos Testes de Integração -----

describe('Fluxo de Autenticação e Autorização', () => {

  // Limpa todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/clientes/register - Deve registar um novo cliente com sucesso', async () => {
    // Simula que o email não existe no banco
    clienteRepository.findByEmail.mockResolvedValue(null);
    // Simula a resposta da criação do novo cliente
    clienteRepository.create.mockResolvedValue({
      id: 1,
      nome_completo: 'Cliente de Teste',
      email: 'teste@cliente.com',
    });

    const response = await request(app)
      .post('/api/auth/clientes/register')
      .send({
        nome_completo: 'Cliente de Teste',
        telefone: '123456789',
        email: 'teste@cliente.com',
        senha: 'senhaForte123'
      });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Cliente registado com sucesso!');
  });


  it('POST /api/auth/login - Deve autenticar um cliente e retornar um token JWT', async () => {
    const email = 'login@cliente.com';
    const senha = 'senhaForte123';
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Simula que o utilizador não é admin nem correspondente
    adminRepository.findByEmail.mockResolvedValue(null);
    correspondenteRepository.findByEmail.mockResolvedValue(null);
    // Simula que o cliente foi encontrado com a senha correta
    clienteRepository.findByEmail.mockResolvedValue({
      id: 1,
      nome_completo: 'Cliente de Login',
      email: email,
      senha_hash: senhaHash
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, senha });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token'); // Verifica se um token foi retornado
  });


  it('POST /api/demandas - Deve permitir que um cliente autenticado crie uma diligência', async () => {
    // 1. Primeiro, simulamos o login para obter um token válido
    const email = 'cliente.logado@teste.com';
    const senha = 'senhaForte123';
    const senhaHash = await bcrypt.hash(senha, 10);

    adminRepository.findByEmail.mockResolvedValue(null);
    correspondenteRepository.findByEmail.mockResolvedValue(null);
    clienteRepository.findByEmail.mockResolvedValue({
      id: 1,
      email,
      senha_hash: senhaHash
    });
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email, senha });
    
    const token = loginResponse.body.token;

    // 2. Agora, usamos o token para tentar criar uma diligência
    const novaDemandaData = {
      titulo: "Diligência de Teste",
      descricao_completa: "Descrição para o teste de integração.",
      valor_proposto_cliente: 150.00
    };

    // Simula a criação da demanda no repositório
    demandaRepository.create.mockResolvedValue({ id: 10, ...novaDemandaData });

    const demandaResponse = await request(app)
      .post('/api/demandas')
      .set('Authorization', `Bearer ${token}`) // Envia o token no cabeçalho
      .send(novaDemandaData);
      
    expect(demandaResponse.statusCode).toBe(201);
    expect(demandaResponse.body.titulo).toBe("Diligência de Teste");
  });


  it('POST /api/demandas - Deve bloquear um utilizador sem token', async () => {
    const response = await request(app)
      .post('/api/demandas')
      .send({
        titulo: "Tentativa Bloqueada",
        descricao_completa: "Não deve funcionar."
      });

    expect(response.statusCode).toBe(401); // 401 Unauthorized
    expect(response.body.error).toBe('Não autorizado, nenhum token fornecido.');
  });
});
