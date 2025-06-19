// controllers/demanda.controller.js

const demandaRepository = require('../repositories/demanda.repository.js');

/**
 * Cria uma nova diligência.
 * Apenas utilizadores com perfil 'cliente' podem criar.
 */
const createDemanda = async (req, res) => {
  try {
    const cliente_id = req.user.userId; // ID do cliente vem do token JWT
    const dadosDemanda = { ...req.body, cliente_id };

    const novaDemanda = await demandaRepository.create(dadosDemanda);
    res.status(201).json(novaDemanda);
  } catch (error) {
    console.error('Erro ao criar diligência:', error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado ao criar a diligência.' });
  }
};

/**
 * Busca uma diligência específica pelo seu ID.
 * Regras de acesso:
 * - Admin pode ver qualquer diligência.
 * - Cliente só pode ver as suas próprias diligências.
 * - Correspondente só pode ver as diligências que lhe foram atribuídas.
 */
const getDemandaById = async (req, res) => {
  try {
    const demandaId = parseInt(req.params.id, 10);
    const { userId, perfil } = req.user;

    const demanda = await demandaRepository.findById(demandaId);

    if (!demanda) {
      return res.status(404).json({ error: 'Diligência não encontrada.' });
    }

    // Verifica a permissão de acesso
    if (
      perfil !== 'admin' &&
      demanda.cliente_id !== userId &&
      demanda.correspondente_id !== userId
    ) {
      return res.status(403).json({ error: 'Acesso negado. Não tem permissão para ver esta diligência.' });
    }

    res.status(200).json(demanda);
  } catch (error) {
    console.error(`Erro ao buscar diligência por ID:`, error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado.' });
  }
};

/**
 * Lista as diligências para o utilizador logado.
 * - Se for 'admin', lista todas.
 * - Se for 'cliente', lista as suas.
 * - Se for 'correspondente', lista as suas.
 */
const getMinhasDemandas = async (req, res) => {
  try {
    const { userId, perfil } = req.user;
    let demandas;

    switch (perfil) {
      case 'admin':
        demandas = await demandaRepository.findAll();
        break;
      case 'cliente':
        demandas = await demandaRepository.findByClienteId(userId);
        break;
      case 'correspondente':
        demandas = await demandaRepository.findByCorrespondenteId(userId);
        break;
      default:
        return res.status(403).json({ error: 'Perfil de utilizador inválido.' });
    }

    res.status(200).json(demandas);
  } catch (error) {
    console.error('Erro ao listar diligências:', error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado.' });
  }
};

/**
 * Atribui uma diligência a um correspondente.
 * Apenas utilizadores com perfil 'admin' podem atribuir.
 */
const assignDemanda = async (req, res) => {
    try {
        const demandaId = parseInt(req.params.id, 10);
        const { correspondenteId } = req.body;

        if (!correspondenteId) {
            return res.status(400).json({ error: 'O ID do correspondente é obrigatório.' });
        }

        const demandaAtualizada = await demandaRepository.assignCorrespondente(demandaId, correspondenteId);

        if (!demandaAtualizada) {
            return res.status(404).json({ error: 'Diligência não encontrada para atribuição.' });
        }
        
        // TODO: Futuramente, disparar uma notificação para o correspondente.

        res.status(200).json(demandaAtualizada);
    } catch (error) {
        console.error('Erro ao atribuir diligência:', error);
        res.status(500).json({ error: 'Ocorreu um erro inesperado ao atribuir a diligência.' });
    }
};

/**
 * Atualiza o status de uma diligência.
 * Apenas 'admin' ou o correspondente atribuído podem atualizar.
 */
const updateDemandaStatus = async (req, res) => {
    try {
        const demandaId = parseInt(req.params.id, 10);
        const { status } = req.body;
        const { userId, perfil } = req.user;

        if (!status) {
            return res.status(400).json({ error: 'O novo status é obrigatório.' });
        }

        // Antes de atualizar, verificar se o utilizador tem permissão
        const demanda = await demandaRepository.findById(demandaId);
        if (!demanda) {
            return res.status(404).json({ error: 'Diligência não encontrada.' });
        }

        if (perfil !== 'admin' && demanda.correspondente_id !== userId) {
            return res.status(403).json({ error: 'Acesso negado. Apenas o administrador ou o correspondente responsável podem alterar o status.' });
        }
        
        const demandaAtualizada = await demandaRepository.updateStatus(demandaId, status);

        // TODO: Futuramente, disparar uma notificação para o cliente.
        
        res.status(200).json(demandaAtualizada);
    } catch (error) {
        console.error('Erro ao atualizar status da diligência:', error);
        res.status(500).json({ error: 'Ocorreu um erro inesperado ao atualizar o status.' });
    }
};

module.exports = {
  createDemanda,
  getDemandaById,
  getMinhasDemandas,
  assignDemanda,
  updateDemandaStatus,
};