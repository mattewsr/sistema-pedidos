const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  async listarPedidos(req, res) {
    try {
      const pedidos = await prisma.pedido.findMany({
        include: {
          cliente: true,
          itensPedido: { include: { produto: true } }
        }
      });
      res.json(pedidos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
  },

  async obterPedidoPorId(req, res) {
    const { id } = req.params;
    try {
      const pedido = await prisma.pedido.findUnique({
        where: { id: Number(id) },
        include: {
          cliente: true,
          itensPedido: { include: { produto: true } }
        }
      });

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      res.json(pedido);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  },

  async criarPedido(req, res) {
    const { clienteId, itens, forma_pagamento, endereco_entrega } = req.body;

    try {
      const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      let total = 0;

      const pedido = await prisma.$transaction(async (tx) => {
        for (const item of itens) {
          const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });

          if (!produto) {
            throw new Error(`Produto ID ${item.produtoId} não encontrado`);
          }

          if (produto.estoque < item.quantidade) {
            throw new Error(`Estoque insuficiente para o produto ${produto.nome}`);
          }

          total += produto.preco * item.quantidade;
        }

        const novoPedido = await tx.pedido.create({
          data: {
            clienteId,
            data_pedido: new Date(),
            status: 'PENDENTE',
            total,
            forma_pagamento,
            endereco_entrega,
            itensPedido: {
              create: itens.map(item => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                preco_unit: item.preco_unit,
                subtotal: item.quantidade * item.preco_unit
              }))
            }
          },
          include: {
            cliente: true,
            itensPedido: { include: { produto: true } }
          }
        });

        for (const item of itens) {
          await tx.produto.update({
            where: { id: item.produtoId },
            data: {
              estoque: {
                decrement: item.quantidade
              }
            }
          });
        }

        return novoPedido;
      });

      res.status(201).json(pedido);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message || 'Erro ao criar pedido' });
    }
  },

  async atualizarPedido(req, res) {
    const { id } = req.params;
    const { status, forma_pagamento, endereco_entrega } = req.body;

    try {
      const pedido = await prisma.pedido.update({
        where: { id: Number(id) },
        data: {
          status,
          forma_pagamento,
          endereco_entrega
        },
        include: {
          cliente: true,
          itensPedido: { include: { produto: true } }
        }
      });

      res.json(pedido);
    } catch (error) {
      console.error(error);
      res.status(404).json({ error: 'Pedido não encontrado ou erro ao atualizar' });
    }
  },

  async deletarPedido(req, res) {
    const { id } = req.params;

    try {
      const pedido = await prisma.pedido.findUnique({
        where: { id: Number(id) },
        include: { itensPedido: true }
      });

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      await prisma.$transaction(async (tx) => {
        for (const item of pedido.itensPedido) {
          await tx.produto.update({
            where: { id: item.produtoId },
            data: {
              estoque: {
                increment: item.quantidade
              }
            }
          });
        }

        await tx.itemPedido.deleteMany({ where: { pedidoId: pedido.id } });
        await tx.pedido.delete({ where: { id: pedido.id } });
      });

      res.json({ message: 'Pedido deletado e estoque ajustado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
  }
};
