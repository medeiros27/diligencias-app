/**
 * controllers/dashboard.controller.js
 * Controlador para fornecer dados agregados e financeiros para o painel de controle.
 */
const db = require('../db');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardData = catchAsync(async (req, res, next) => {
    // Garante que apenas administradores possam acessar os dados do dashboard
    if (req.user.perfil !== 'admin') {
        const err = new Error('Acesso negado. Apenas administradores podem ver o dashboard.');
        err.statusCode = 403;
        return next(err);
    }

    // NOTA: As queries abaixo assumem que sua tabela 'demandas' possui as colunas:
    // 'valor_receber', 'valor_pagar', 'recebido', 'pago', 'data_demanda', e 'tipo_demanda'.
    // Certifique-se de que seu esquema de banco de dados corresponde a estas colunas.

    // Query para os cards de resumo financeiro
    const summaryQuery = `
        SELECT
            (SELECT SUM(valor_receber) FROM demandas) AS "faturamentoBruto",
            (SELECT SUM(valor_pagar) FROM demandas) AS "custosTotais",
            (SELECT SUM(valor_receber - valor_pagar) FROM demandas) AS "lucroLiquido",
            (SELECT SUM(CASE WHEN recebido = false THEN valor_receber ELSE 0 END) FROM demandas) AS "aReceber",
            (SELECT SUM(CASE WHEN pago = false THEN valor_pagar ELSE 0 END) FROM demandas) AS "aPagar"
    `;

    // Query para o gráfico de performance mensal (últimos 12 meses)
    const monthlyQuery = `
        SELECT
            TO_CHAR(DATE_TRUNC('month', data_demanda), 'YYYY-MM') AS mes,
            SUM(valor_receber) AS faturamento,
            SUM(valor_pagar) AS custo
        FROM demandas
        WHERE data_demanda >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
        GROUP BY mes
        ORDER BY mes;
    `;

    // Query para o gráfico de tipos de demanda
    const typesQuery = `
        SELECT tipo_demanda, COUNT(*) AS quantidade
        FROM demandas
        WHERE tipo_demanda IS NOT NULL AND tipo_demanda <> ''
        GROUP BY tipo_demanda
        ORDER BY quantidade DESC;
    `;
    
    // Executa todas as queries em paralelo para máxima performance
    const [summaryRes, monthlyRes, typesRes] = await Promise.all([
        db.query(summaryQuery),
        db.query(monthlyQuery),
        db.query(typesQuery)
    ]);

    // Responde com os dados consolidados
    res.status(200).json({
        summary: summaryRes.rows[0],
        monthlyPerformance: monthlyRes.rows,
        demandTypes: typesRes.rows
    });
});
