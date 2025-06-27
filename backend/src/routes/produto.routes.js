const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller');

router.get('/', produtoController.listarProdutos);
router.get('/:id', produtoController.obterProdutoPorId);
router.post('/', produtoController.criarProduto);
router.put('/:id', produtoController.atualizarProduto);
router.delete('/:id', produtoController.deletarProduto);

module.exports = router;
