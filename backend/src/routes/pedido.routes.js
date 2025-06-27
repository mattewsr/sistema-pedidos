const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido.controller');

// Endpoints CRUD de Pedido
router.get('/', pedidoController.listarPedidos);               // Listar todos
router.get('/:id', pedidoController.obterPedidoPorId);         // Obter por ID
router.post('/', pedidoController.criarPedido);                // Criar novo pedido
router.put('/:id', pedidoController.atualizarPedido);          // Atualizar pedido (ex.: status, forma de pagamento, endereço)
router.delete('/:id', pedidoController.deletarPedido);         // Deletar pedido

module.exports = router;
