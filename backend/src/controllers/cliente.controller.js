const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async listarClientes(req, res) {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  },

  async obterClientePorId(req, res) {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } });
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(cliente);
  },

  async criarCliente(req, res) {
    const { nome, cpf_cnpj, telefone, email, endereco } = req.body;
    try {
      const cliente = await prisma.cliente.create({
        data: { nome, cpf_cnpj, telefone, email, endereco }
      });
      res.status(201).json(cliente);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar cliente', detalhe: error });
    }
  },

  async atualizarCliente(req, res) {
    const { id } = req.params;
    const data = req.body;
    try {
      const cliente = await prisma.cliente.update({
        where: { id: Number(id) },
        data
      });
      res.json(cliente);
    } catch (error) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  },

  async deletarCliente(req, res) {
    const { id } = req.params;
    try {
      await prisma.cliente.delete({ where: { id: Number(id) } });
      res.json({ message: 'Cliente deletado com sucesso' });
    } catch (error) {
      res.status(404).json({ error: 'Cliente não encontrado' });
    }
  }
};
