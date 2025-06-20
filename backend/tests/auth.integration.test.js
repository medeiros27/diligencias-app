/**
 * tests/auth.integration.test.js
 * Testes de integração para o fluxo de autenticação (login).
 * NOTA: Este teste requer uma base de dados de teste separada para não interferir com os dados de desenvolvimento.
 */
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // O nosso módulo de base de dados
const authRoutes = require('../routes/auth.routes');
const errorHandler = require('../middlewares/error.middleware');

// Configuração da aplicação Express para os testes
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Fluxo de Autenticação (/api/auth)', () => {

    // Antes de todos os testes, criamos utilizadores de teste nas respectivas tabelas.
    beforeAll(async () => {
        // Limpa as tabelas para garantir um estado limpo
        await db.query('DELETE FROM log_atividades');
        await db.query('DELETE FROM anexos_demandas');
        await db.query('DELETE FROM demandas');
        await db.query('DELETE FROM admins');
        await db.query('DELETE FROM clientes');
        await db.query('DELETE FROM correspondentes_servicos');

        // Cria um utilizador de cada perfil
        const adminSenha = await bcrypt.hash('senhaAdmin123', 10);
        await db.query(`INSERT INTO admins (nome, email, senha_hash) VALUES ('Admin Teste', 'admin@teste.com', '${adminSenha}')`);

        const clienteSenha = await bcrypt.hash('senhaCliente123', 10);
        await db.query(`INSERT INTO clientes (nome_completo, telefone, email, senha_hash) VALUES ('Cliente Teste', '11999999999', 'cliente@teste.com', '${clienteSenha}')`);

        const corrSenha = await bcrypt.hash('senhaCorr123', 10);
        // CORREÇÃO: Adicionamos o campo 'oab' com um valor para o correspondente do tipo 'Advogado'.
        await db.query(`
            INSERT INTO correspondentes_servicos (nome_completo, tipo, oab, cpf, email, telefone, comarcas_atendidas, senha_hash) 
            VALUES ('Corr Teste', 'Advogado', 'SP123456', '123.456.789-00', 'corr@teste.com', '11888888888', 'São Paulo', '${corrSenha}')
        `);
    });
    
    it('deve autenticar um admin com sucesso e retornar um token', async () => {
        const res = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'admin@teste.com',
                password: 'senhaAdmin123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.perfil).toBe('admin');
    });

    it('deve autenticar um cliente com sucesso e retornar um token', async () => {
        const res = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'cliente@teste.com',
                password: 'senhaCliente123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.perfil).toBe('cliente');
    });

    it('deve autenticar um correspondente com sucesso e retornar um token', async () => {
        const res = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'corr@teste.com',
                password: 'senhaCorr123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.perfil).toBe('correspondente');
    });

    it('deve retornar erro 401 com uma senha incorreta', async () => {
        const res = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'admin@teste.com',
                password: 'senhaErrada'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toContain('inválidas');
    });

    it('deve retornar erro 401 com um email inexistente', async () => {
        const res = await request(app)
            .post('/api/auth/signin')
            .send({
                email: 'fantasma@naoexiste.com',
                password: 'qualquersenha'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toContain('inválidas');
    });
});
