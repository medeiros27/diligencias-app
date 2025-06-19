// controllers/user.controller.js

const clienteRepository = require('../repositories/cliente.repository');
const correspondenteRepository = require('../repositories/correspondente.repository');

/**
 * Lista todos os clientes registados.
 * Apenas para utilizadores com perfil 'admin'.
 */
const listClientes = async (req, res) => {
  try {
    const clientes = await clienteRepository.findAll();
    res.status(200).json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado ao listar os clientes.' });
  }
};

/**
 * Lista todos os correspondentes registados.
 * Apenas para utilizadores com perfil 'admin'.
 */
const listCorrespondentes = async (req, res) => {
  try {
    const correspondentes = await correspondenteRepository.findAll();
    res.status(200).json(correspondentes);
  } catch (error) {
    console.error('Erro ao listar correspondentes:', error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado ao listar os correspondentes.' });
  }
};

/**
 * Atualiza o status (ativo/inativo) de um cliente.
 * Apenas para utilizadores com perfil 'admin'.
 */
const updateClienteStatus = async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id, 10);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'O campo "isActive" é obrigatório e deve ser um booleano.' });
    }

    const clienteAtualizado = await clienteRepository.updateActiveStatus(clienteId, isActive);

    if (!clienteAtualizado) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.status(200).json(clienteAtualizado);
  } catch (error) {
    console.error(`Erro ao atualizar status do cliente (${req.params.id}):`, error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado.' });
  }
};

/**
 * Atualiza o status (ativo/inativo) de um correspondente.
 * Apenas para utilizadores com perfil 'admin'.
 */
const updateCorrespondenteStatus = async (req, res) => {
    try {
      const correspondenteId = parseInt(req.params.id, 10);
      const { isActive } = req.body;
  
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'O campo "isActive" é obrigatório e deve ser um booleano.' });
      }
  
      const correspondenteAtualizado = await correspondenteRepository.updateActiveStatus(correspondenteId, isActive);
  
      if (!correspondenteAtualizado) {
        return res.status(404).json({ error: 'Correspondente não encontrado.' });
      }
  
      res.status(200).json(correspondenteAtualizado);
    } catch (error) {
      console.error(`Erro ao atualizar status do correspondente (${req.params.id}):`, error);
      res.status(500).json({ error: 'Ocorreu um erro inesperado.' });
    }
  };

module.exports = {
  listClientes,
  listCorrespondentes,
  updateClienteStatus,
  updateCorrespondenteStatus,
};