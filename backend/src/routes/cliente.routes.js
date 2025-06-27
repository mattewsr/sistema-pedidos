const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔹 Listar clientes
router.get('/', async (req, res) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
});

// 🔹 Criar cliente
router.post('/', async (req, res) => {
  const { nome, cpf_cnpj, telefone, email, endereco } = req.body;
  const cliente = await prisma.cliente.create({
    data: { nome, cpf_cnpj, telefone, email, endereco }
  });
  res.json(cliente);
});

// 🔹 Atualizar cliente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const cliente = await prisma.cliente.update({
    where: { id: Number(id) },
    data
  });
  res.json(cliente);
});

// 🔹 Deletar cliente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.cliente.delete({
    where: { id: Number(id) }
  });
  res.json({ message: 'Cliente deletado com sucesso' });
});

module.exports = router;
