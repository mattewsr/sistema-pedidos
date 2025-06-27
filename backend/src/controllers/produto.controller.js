const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async listarProdutos(req, res) {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  },

  async obterProdutoPorId(req, res) {
    const { id } = req.params;
    const produto = await prisma.produto.findUnique({ where: { id: Number(id) } });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produto);
  },

  async criarProduto(req, res) {
    const { nome, descricao, preco, estoque, categoria } = req.body;
    try {
      const produto = await prisma.produto.create({
        data: { nome, descricao, preco, estoque, categoria }
      });
      res.status(201).json(produto);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar produto', detalhe: error });
    }
  },

  async atualizarProduto(req, res) {
    const { id } = req.params;
    const data = req.body;
    try {
      const produto = await prisma.produto.update({
        where: { id: Number(id) },
        data
      });
      res.json(produto);
    } catch (error) {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  },

  async deletarProduto(req, res) {
    const { id } = req.params;
    try {
      await prisma.produto.delete({ where: { id: Number(id) } });
      res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  }
};
