// tests/demanda.integration.test.js

require('dotenv').config();
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Recriar uma instância do app para o teste.
const app = express();
app.use(bodyParser.json());

// Importar as rotas que vamos testar
const demandaRoutes = require('../routes/demanda.routes');
app.use('/api/demandas', demandaRoutes);

// --- Mocks dos Repositórios ---
jest.mock('../repositories/demanda.repository');
const demandaRepository = require('../repositories/demanda.repository');

// ----- Helper Functions for Tests -----
// Função auxiliar para gerar um token de teste para um perfil específico
const generateTestToken = (userId, perfil) => {
  const payload = { userId, perfil, email: `${perfil}@teste.com` };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};


// ----- Início dos Testes de Integração para Demandas -----

describe('Fluxo de Atualização de Demandas', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Testes para PUT /api/demandas/:id/atribuir ---

  it('PUT /atribuir - Deve permitir que um Admin atribua uma diligência', async () => {
    const adminToken = generateTestToken(1, 'admin');
    const demandaId = 10;
    const correspondenteId = 5;

    // Simula a resposta do repositório
    demandaRepository.assignCorrespondente.mockResolvedValue({
      id: demandaId,
      correspondente_id: correspondenteId,
      status: 'Em Andamento'
    });

    const response = await request(app)
      .put(`/api/demandas/${demandaId}/atribuir`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ correspondenteId });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('Em Andamento');
    expect(demandaRepository.assignCorrespondente).toHaveBeenCalledWith(demandaId, correspondenteId);
  });

  it('PUT /atribuir - Deve bloquear um Cliente de atribuir uma diligência', async () => {
    const clienteToken = generateTestToken(2, 'cliente');
    const demandaId = 10;
    const correspondenteId = 5;

    const response = await request(app)
      .put(`/api/demandas/${demandaId}/atribuir`)
      .set('Authorization', `Bearer ${clienteToken}`)
      .send({ correspondenteId });

    expect(response.statusCode).toBe(403); // Forbidden
    expect(response.body.error).toContain('Acesso negado');
  });


  // --- Testes para PUT /api/demandas/:id/status ---

  it('PUT /status - Deve permitir que um Admin atualize o status', async () => {
    const adminToken = generateTestToken(1, 'admin');
    const demandaId = 15;
    const novoStatus = 'Cumprida';

    // Para o controller verificar a permissão, primeiro simulamos a busca da demanda
    demandaRepository.findById.mockResolvedValue({ id: demandaId, correspondente_id: null });
    // E depois a atualização
    demandaRepository.updateStatus.mockResolvedValue({ id: demandaId, status: novoStatus });

    const response = await request(app)
      .put(`/api/demandas/${demandaId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: novoStatus });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(novoStatus);
  });

  it('PUT /status - Deve permitir que o Correspondente responsável atualize o status', async () => {
    const correspondenteId = 7;
    const correspondenteToken = generateTestToken(correspondenteId, 'correspondente');
    const demandaId = 20;
    const novoStatus = 'Cumprida';
    
    // Simula que a demanda pertence a este correspondente
    demandaRepository.findById.mockResolvedValue({ id: demandaId, correspondente_id: correspondenteId });
    demandaRepository.updateStatus.mockResolvedValue({ id: demandaId, status: novoStatus });

    const response = await request(app)
      .put(`/api/demandas/${demandaId}/status`)
      .set('Authorization', `Bearer ${correspondenteToken}`)
      .send({ status: novoStatus });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe(novoStatus);
  });

  it('PUT /status - Deve bloquear um Correspondente que não é o responsável', async () => {
    const outroCorrespondenteId = 8;
    const outroCorrespondenteToken = generateTestToken(outroCorrespondenteId, 'correspondente');
    const demandaId = 20;
    
    // Simula que a demanda pertence a OUTRO correspondente (ID 7)
    demandaRepository.findById.mockResolvedValue({ id: demandaId, correspondente_id: 7 });

    const response = await request(app)
      .put(`/api/demandas/${demandaId}/status`)
      .set('Authorization', `Bearer ${outroCorrespondenteToken}`)
      .send({ status: 'Cumprida' });

    expect(response.statusCode).toBe(403);
    expect(response.body.error).toContain('Apenas o administrador ou o correspondente responsável');
  });

});
