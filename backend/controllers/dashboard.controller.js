const db = require('../db');

exports.getDashboardData = async (req, res) => {
    try {
        // Query única para buscar todos os dados necessários de forma eficiente.
        const query = `
            SELECT
                (SELECT SUM(valor_receber) FROM demandas) AS "faturamentoBruto",
                (SELECT SUM(valor_pagar) FROM demandas) AS "custosTotais",
                (SELECT SUM(valor_receber - valor_pagar) FROM demandas) AS "lucroLiquido",
                (SELECT SUM(CASE WHEN recebido = false THEN valor_receber ELSE 0 END) FROM demandas) AS "aReceber",
                (SELECT SUM(CASE WHEN pago = false THEN valor_pagar ELSE 0 END) FROM demandas) AS "aPagar"
        `;

        // Queries para os gráficos
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

        const typesQuery = `
            SELECT tipo_demanda, COUNT(*) AS quantidade
            FROM demandas
            WHERE tipo_demanda IS NOT NULL AND tipo_demanda <> ''
            GROUP BY tipo_demanda
            ORDER BY quantidade DESC;
        `;
        
        // Executa todas as queries em paralelo para máxima performance
        const [summaryRes, monthlyRes, typesRes] = await Promise.all([
            db.query(query),
            db.query(monthlyQuery),
            db.query(typesQuery)
        ]);

        res.status(200).json({
            summary: summaryRes.rows[0],
            monthlyPerformance: monthlyRes.rows,
            demandTypes: typesRes.rows
        });

    } catch (error) {
        console.error("--- ERRO AO BUSCAR DADOS DO DASHBOARD ---", error);
        res.status(500).json({ error: "Erro ao carregar dados do dashboard." });
    }
};
