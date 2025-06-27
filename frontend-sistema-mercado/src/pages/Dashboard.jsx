import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [resumo, setResumo] = useState({
    totalClientes: 0,
    totalProdutos: 0,
    totalPedidos: 0,
    valorTotalPedidos: 0
  });

  useEffect(() => {
    async function fetchResumo() {
      const [clientes, produtos, pedidos] = await Promise.all([
        axios.get("http://localhost:3000/clientes"),
        axios.get("http://localhost:3000/produtos"),
        axios.get("http://localhost:3000/pedidos")
      ]);

      const valorTotal = pedidos.data.reduce((soma, p) => soma + (p.total || 0), 0);

      setResumo({
        totalClientes: clientes.data.length,
        totalProdutos: produtos.data.length,
        totalPedidos: pedidos.data.length,
        valorTotalPedidos: valorTotal
      });
    }

    fetchResumo();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Resumo Geral</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-600">Clientes</p>
          <p className="text-2xl font-bold">{resumo.totalClientes}</p>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-600">Produtos</p>
          <p className="text-2xl font-bold">{resumo.totalProdutos}</p>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-600">Pedidos</p>
          <p className="text-2xl font-bold">{resumo.totalPedidos}</p>
        </div>
        <div className="bg-white shadow rounded p-4 text-center">
          <p className="text-gray-600">Total em Vendas</p>
          <p className="text-2xl font-bold">R$ {resumo.valorTotalPedidos.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
