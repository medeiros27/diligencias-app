// tests/user.integration.test.js

require('dotenv').config();
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Recriar uma instância da app para o teste
const app = express();
app.use(bodyParser.json());

// Importar as rotas que vamos testar
const userRoutes = require('../routes/user.routes');
app.use('/api/users', userRoutes);

// --- Mocks dos Repositórios ---
jest.mock('../repositories/cliente.repository');
jest.mock('../repositories/correspondente.repository');
const clienteRepository = require('../repositories/cliente.repository');

// ----- Funções Auxiliares para os Testes -----
// Função para gerar um token de teste para um perfil específico
const generateTestToken = (userId, perfil) => {
  const payload = { userId, perfil, email: `${perfil}@teste.com` };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// ----- Início dos Testes de Integração para Gestão de Utilizadores -----

describe('Fluxo de Gestão de Utilizadores (Admin)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Testes para GET /api/users/clientes ---

  it('GET /clientes - Deve permitir que um Admin liste todos os clientes', async () => {
    const adminToken = generateTestToken(1, 'admin');
    const mockClientes = [{ id: 1, nome_completo: 'Cliente Teste 1' }];

    // Simula a resposta do repositório
    clienteRepository.findAll.mockResolvedValue(mockClientes);

    const response = await request(app)
      .get('/api/users/clientes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockClientes);
    expect(clienteRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /clientes - Deve bloquear um Cliente de listar todos os clientes', async () => {
    const clienteToken = generateTestToken(2, 'cliente');

    const response = await request(app)
      .get('/api/users/clientes')
      .set('Authorization', `Bearer ${clienteToken}`);

    expect(response.statusCode).toBe(403); // Forbidden
    expect(response.body.error).toContain('Acesso negado');
  });

  // --- Testes para PUT /api/users/clientes/:id/status ---

  it('PUT /clientes/:id/status - Deve permitir que um Admin atualize o status de um cliente', async () => {
    const adminToken = generateTestToken(1, 'admin');
    const clienteId = 5;
    const novoStatus = { isActive: false };

    // Simula a resposta do repositório
    clienteRepository.updateActiveStatus.mockResolvedValue({ 
      id: clienteId, 
      nome_completo: 'Cliente Atualizado', 
      is_active: false 
    });

    const response = await request(app)
      .put(`/api/users/clientes/${clienteId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(novoStatus);

    expect(response.statusCode).toBe(200);
    expect(response.body.is_active).toBe(false);
    expect(clienteRepository.updateActiveStatus).toHaveBeenCalledWith(clienteId, false);
  });

  it('PUT /clientes/:id/status - Deve retornar 400 se o campo isActive não for enviado', async () => {
    const adminToken = generateTestToken(1, 'admin');
    const clienteId = 5;

    const response = await request(app)
      .put(`/api/users/clientes/${clienteId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({}); // Corpo da requisição vazio

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toContain('obrigatório e deve ser um booleano');
  });

});
