/**
 * repositories/auth.repository.js
 * Repositório dedicado a encontrar utilizadores para fins de autenticação,
 * pesquisando nas várias tabelas de perfis (admins, clientes, correspondentes).
 */
const db = require('../db');

/**
 * Encontra um utilizador pelo seu email.
 * Pesquisa sequencialmente nas tabelas de admins, clientes e correspondentes.
 * @param {string} email O email do utilizador a ser encontrado.
 * @returns {Promise<object|null>} Um objeto contendo os dados do utilizador e o seu perfil, ou null se não for encontrado.
 */
exports.findUserByEmail = async (email) => {
    // 1. Tenta encontrar como Admin
    let result = await db.query('SELECT id, nome, email, senha_hash, \'admin\' as perfil FROM admins WHERE email = $1 AND is_active = true', [email]);
    if (result.rows.length > 0) {
        return result.rows[0];
    }

    // 2. Tenta encontrar como Cliente
    result = await db.query('SELECT id, nome_completo as nome, email, senha_hash, \'cliente\' as perfil FROM clientes WHERE email = $1 AND is_active = true', [email]);
    if (result.rows.length > 0) {
        return result.rows[0];
    }

    // 3. Tenta encontrar como Correspondente
    result = await db.query('SELECT id, nome_completo as nome, email, senha_hash, \'correspondente\' as perfil FROM correspondentes_servicos WHERE email = $1 AND is_active = true', [email]);
    if (result.rows.length > 0) {
        return result.rows[0];
    }

    // Se não encontrou em nenhuma tabela, retorna null
    return null;
};
