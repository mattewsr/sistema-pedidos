const express = require('express');
const cors = require('cors');

// Importar rotas
const clienteRoutes = require('./routes/cliente.routes');
const produtoRoutes = require('./routes/produto.routes');
const pedidoRoutes = require('./routes/pedido.routes');


const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/clientes', clienteRoutes);
app.use('/produtos', produtoRoutes);
app.use('/pedidos', pedidoRoutes);
app.get('/', (req, res) => {
  res.send('API Sistema Mercado funcionando!');
});

module.exports = app;
