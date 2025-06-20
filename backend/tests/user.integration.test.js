/**
 * tests/user.integration.test.js
 * Testes de integração para as rotas de gestão de utilizadores por administradores.
 */
const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/user.routes');
const errorHandler = require('../middlewares/error.middleware');
const clienteRepository = require('../repositories/cliente.repository');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

// CORREÇÃO: Mockamos os módulos dos repositórios E do middleware de autenticação.
jest.mock('../repositories/cliente.repository');
jest.mock('../repositories/correspondente.repository');
jest.mock('../middlewares/auth.middleware');

const app = express();
app.use(express.json());
// Usamos as rotas reais porque os middlewares DENTRO delas estão agora mockados.
app.use('/api/users', userRoutes);
app.use(errorHandler);


describe('Fluxo de Gestão de Utilizadores (Admin)', () => {

    beforeEach(() => {
        // Limpa todos os mocks antes de cada teste.
        jest.clearAllMocks();

        // CORREÇÃO: Configuramos o comportamento do middleware mockado.
        // Simulamos um admin logado com sucesso para todos os testes neste 'describe'.
        verifyToken.mockImplementation((req, res, next) => {
            req.user = { id: 1, perfil: 'admin' };
            next();
        });
        // Fazemos com que o middleware authorize sempre permita o acesso.
        authorize.mockImplementation(() => (req, res, next) => next());
    });

    it('GET /api/users/clientes - Deve permitir que um Admin liste todos os clientes', async () => {
        const mockClientes = [{ id: 1, nome_completo: 'Cliente Teste' }];
        clienteRepository.findAll.mockResolvedValue(mockClientes);

        const response = await request(app).get('/api/users/clientes');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockClientes);
    });
    
    it('PUT /api/users/clientes/:id/status - Deve permitir que um Admin atualize o status de um cliente', async () => {
        const clienteId = 1;
        clienteRepository.updateStatus.mockResolvedValue({ id: clienteId });

        const response = await request(app)
            .put(`/api/users/clientes/${clienteId}/status`)
            .send({ ativo: false });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toContain('Status do cliente 1 atualizado com sucesso.');
    });

    it('PUT /api/users/clientes/:id/status - Deve retornar 400 se o campo "ativo" não for booleano', async () => {
        const response = await request(app)
            .put('/api/users/clientes/1/status')
            .send({ ativo: 'string_invalida' });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toContain('obrigatório e deve ser um booleano');
    });

});
