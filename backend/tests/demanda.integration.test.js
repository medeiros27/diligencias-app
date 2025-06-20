/**
 * tests/demanda.integration.test.js
 * Testes de integração para o fluxo de gestão de demandas.
 */
const request = require('supertest');
const express = require('express');
const demandaRoutes = require('../routes/demanda.routes');
const errorHandler = require('../middlewares/error.middleware');
const demandaRepository = require('../repositories/demanda.repository');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

// CORREÇÃO: Mockamos todas as dependências externas que a rota utiliza.
jest.mock('../repositories/demanda.repository');
jest.mock('../middlewares/auth.middleware');
// Também mockamos o middleware de upload para que ele não tente guardar ficheiros durante o teste.
jest.mock('../middlewares/upload.middleware', () => ({
    single: () => (req, res, next) => {
        // Simula um upload de ficheiro bem-sucedido
        req.file = { originalname: 'test.pdf', path: 'uploads/test.pdf', mimetype: 'application/pdf', size: 12345 };
        next();
    },
}));


const app = express();
app.use(express.json());
// Usamos as rotas reais porque os middlewares DENTRO delas estão agora mockados.
app.use('/api/demandas', demandaRoutes);
app.use(errorHandler);


describe('Fluxo de Gestão de Demandas', () => {

    beforeEach(() => {
        // Limpa os mocks antes de cada teste para garantir um estado limpo.
        jest.clearAllMocks();
        
        // Configura o comportamento padrão do middleware de autorização
        authorize.mockImplementation((...allowedProfiles) => {
            return (req, res, next) => {
                if (req.user && allowedProfiles.includes(req.user.perfil)) {
                    return next();
                }
                return res.status(403).send({ message: "Acesso negado." });
            };
        });
    });

    describe('Criação (POST /)', () => {
        it('Deve permitir que um CLIENTE crie uma nova demanda', async () => {
            // Simula um utilizador 'cliente' logado
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: 1, perfil: 'cliente' };
                next();
            });

            const demandaData = { titulo: "Diligência de Teste", descricao_completa: "Descrição detalhada." };
            demandaRepository.create.mockResolvedValue({ id: 1, ...demandaData });
    
            const response = await request(app)
                .post('/api/demandas')
                .send(demandaData);
    
            expect(response.statusCode).toBe(201);
            expect(response.body.id).toBe(1);
        });
    
        it('Deve impedir que um ADMIN crie uma nova demanda', async () => {
            // Simula um utilizador 'admin' logado
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: 99, perfil: 'admin' };
                next();
            });
    
            const response = await request(app)
                .post('/api/demandas')
                .send({ titulo: "Tentativa de Admin" });
    
            expect(response.statusCode).toBe(403);
        });
    });

    describe('Atribuição (PATCH /assign/:id)', () => {
        it('Deve permitir que um ADMIN atribua uma diligência', async () => {
            // Simula um utilizador 'admin' logado
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: 99, perfil: 'admin' };
                next();
            });

            const demandaId = 1;
            const correspondenteId = 10;
            demandaRepository.assignCorrespondente.mockResolvedValue({ id: demandaId, correspondente_id: correspondenteId });
    
            const response = await request(app)
                .patch(`/api/demandas/assign/${demandaId}`)
                .send({ correspondenteId });
    
            expect(response.statusCode).toBe(200);
            expect(response.body.correspondente_id).toBe(correspondenteId);
        });

        it('Deve impedir que um CLIENTE atribua uma diligência', async () => {
            // Simula um utilizador 'cliente' logado
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: 1, perfil: 'cliente' };
                next();
            });
            
            const response = await request(app)
                .patch('/api/demandas/assign/1')
                .send({ correspondenteId: 10 });
    
            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("Acesso negado.");
        });
    });

    describe('Atualização de Status (PATCH /status/:id)', () => {
        it('Deve permitir que um ADMIN atualize o status', async () => {
            // Simula um utilizador 'admin' logado
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: 99, perfil: 'admin' };
                next();
            });

            const demandaId = 1;
            const novoStatus = 'Em Andamento';
            
            // Simula a busca da demanda antes da atualização
            demandaRepository.findById.mockResolvedValue({ id: demandaId, correspondente_id: null, status: 'Pendente' });
            // Simula a atualização do status
            demandaRepository.updateStatus.mockResolvedValue({ id: demandaId, status: novoStatus });

            const response = await request(app)
                .patch(`/api/demandas/status/${demandaId}`)
                .send({ status: novoStatus });

            expect(response.statusCode).toBe(200);
            expect(response.body.status).toBe(novoStatus);
        });

        it('Deve permitir que o CORRESPONDENTE responsável atualize o status', async () => {
            const correspondenteId = 10;
            const demandaId = 1;
             // Simula um utilizador 'correspondente' logado
             verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: correspondenteId, perfil: 'correspondente' };
                next();
            });

            const novoStatus = 'Cumprida';
            demandaRepository.findById.mockResolvedValue({ id: demandaId, correspondente_id: correspondenteId, status: 'Em Andamento' });
            demandaRepository.updateStatus.mockResolvedValue({ id: demandaId, status: novoStatus });

            const response = await request(app)
                .patch(`/api/demandas/status/${demandaId}`)
                .send({ status: novoStatus });
            
            expect(response.statusCode).toBe(200);
            expect(response.body.status).toBe(novoStatus);
        });

        it('Deve impedir que um CORRESPONDENTE que não é o responsável atualize o status', async () => {
            const demandaId = 1;
            // Simula um correspondente qualquer (ID 999) que não é o responsável (ID 10)
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: 999, perfil: 'correspondente' };
                next();
            });

            // Simula a busca da demanda, que pertence a outro correspondente
            demandaRepository.findById.mockResolvedValue({ id: demandaId, correspondente_id: 10, status: 'Em Andamento' });

            const response = await request(app)
                .patch(`/api/demandas/status/${demandaId}`)
                .send({ status: 'Cumprida' });

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toContain('Acesso negado');
        });

        it('Deve impedir que um CLIENTE atualize o status', async () => {
            // Simula um utilizador 'cliente' logado
            verifyToken.mockImplementation((req, res, next) => {
                req.user = { id: 1, perfil: 'cliente' };
                next();
            });
            
            const response = await request(app)
                .patch('/api/demandas/status/1')
                .send({ status: 'Qualquer' });
    
            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("Acesso negado.");
        });
    });
});
