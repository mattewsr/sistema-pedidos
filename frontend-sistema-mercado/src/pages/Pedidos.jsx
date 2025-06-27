import { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Pedidos() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filtroCliente, setFiltroCliente] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [itensPedido, setItensPedido] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState("");
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [enderecoEntrega, setEnderecoEntrega] = useState("");

  useEffect(() => {
    fetchClientes();
    fetchProdutos();
    fetchPedidos();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/clientes");
      setClientes(res.data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  const fetchProdutos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/produtos");
      setProdutos(res.data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  const fetchPedidos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/pedidos?_expand=cliente");
      setPedidos(res.data);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    }
  };

  const adicionarItem = () => {
    const produto = produtos.find((p) => p.id === parseInt(produtoSelecionado));
    const quantidade = parseInt(quantidadeSelecionada);
    if (produto && quantidade > 0 && quantidade <= produto.estoque) {
      setItensPedido([...itensPedido, { produtoId: produto.id, quantidade, produto }]);
      setProdutoSelecionado("");
      setQuantidadeSelecionada(1);
    } else {
      alert("Quantidade inválida ou maior que o estoque.");
    }
  };

  const removerItem = (index) => {
    setItensPedido(itensPedido.filter((_, i) => i !== index));
  };

  const deletarPedido = async (id) => {
    if (confirm("Deseja realmente excluir este pedido?")) {
      await axios.delete(`http://localhost:3000/pedidos/${id}`);
      if (modoEdicao && pedidoEditando?.id === id) {
        setModoEdicao(false);
        setPedidoEditando(null);
        setItensPedido([]);
        setClienteSelecionado(null);
        setFormaPagamento("");
        setEnderecoEntrega("");
      }
      fetchPedidos();
    }
  };

  const criarOuAtualizarPedido = async () => {
    console.log("Dados do pedido:", {
      clienteSelecionado,
      itensPedido,
      formaPagamento,
      enderecoEntrega,
      pedidoEditando
    });

    if (!clienteSelecionado || itensPedido.length === 0 || !formaPagamento || !enderecoEntrega) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (modoEdicao) {
      if (!pedidoEditando || !pedidoEditando.id) {
        alert("Pedido não encontrado para edição.");
        return;
      }

      const existe = pedidos.find(p => p.id === pedidoEditando.id);
      if (!existe) {
        alert("Este pedido foi removido e não pode mais ser editado.");
        setModoEdicao(false);
        setPedidoEditando(null);
        setItensPedido([]);
        setClienteSelecionado(null);
        setFormaPagamento("");
        setEnderecoEntrega("");
        return;
      }
    }

    const total = itensPedido.reduce((sum, item) => {
      return sum + (item.quantidade * item.produto.preco);
    }, 0);

    const payload = {
      clienteId: clienteSelecionado.id,
      forma_pagamento: formaPagamento,
      endereco_entrega: enderecoEntrega,
      total: total,
      status: pedidoEditando?.status || "PENDENTE",
      itens: itensPedido.map((item) => ({
        produtoId: item.produtoId,
        quantidade: parseInt(item.quantidade),
        preco_unit: item.produto.preco
      }))
    };

    try {
      if (modoEdicao && pedidoEditando) {
        console.log("Atualizando pedido ID:", pedidoEditando.id, "com payload:", payload);
        await axios.put(`http://localhost:3000/pedidos/${pedidoEditando.id}`, payload);
      } else {
        await axios.post("http://localhost:3000/pedidos", payload);
      }

      setClienteSelecionado(null);
      setItensPedido([]);
      setFiltroCliente("");
      setFormaPagamento("");
      setEnderecoEntrega("");
      setModoEdicao(false);
      setPedidoEditando(null);
      fetchPedidos();
    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      alert(`Erro ao ${modoEdicao ? 'atualizar' : 'criar'} pedido: ${error.response?.data?.message || error.message}`);
    }
  };  const editarPedido = (pedido) => {
    setClienteSelecionado(pedido.cliente);
    setItensPedido(pedido.itens || []);
    setFormaPagamento(pedido.forma_pagamento || "");
    setEnderecoEntrega(pedido.endereco_entrega || "");
    setModoEdicao(true);
    setPedidoEditando(pedido);
  };

  const atualizarStatus = async (pedido, novoStatus) => {
    try {
      console.log("Atualizando status do pedido ID:", pedido.id, "para:", novoStatus);
      await axios.put(`http://localhost:3000/pedidos/${pedido.id}`, {
        status: novoStatus
      });
      fetchPedidos();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(pedidos.map((p) => ({
      ID: p.id,
      Cliente: p.cliente?.nome || "N/A",
      CPF: p.cliente?.cpf || p.cliente?.cpf_cnpj || "N/A",
      Status: p.status || "Pendente",
      Total: p.total || 0,
      FormaPagamento: p.forma_pagamento,
      EnderecoEntrega: p.endereco_entrega
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "pedidos.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Pedidos", 14, 15);
    const tabela = pedidos.map((p) => [
      p.id,
      p.cliente?.nome || "N/A",
      p.cliente?.cpf || p.cliente?.cpf_cnpj || "N/A",
      p.status || "Pendente",
      p.total || 0,
      p.forma_pagamento || "",
      p.endereco_entrega || ""
    ]);
    autoTable(doc, {
      head: [["ID", "Cliente", "CPF", "Status", "Total", "Pagamento", "Endereço"]],
      body: tabela,
      startY: 20
    });
    doc.save("pedidos.pdf");
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Pedidos</h2>

      <input
        type="text"
        placeholder="Digite o nome ou CPF do cliente"
        value={filtroCliente}
        onChange={(e) => setFiltroCliente(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />

      <select
        value={clienteSelecionado?.id || ""}
        onChange={(e) => {
          const cliente = clientes.find((c) => c.id === parseInt(e.target.value));
          setClienteSelecionado(cliente);
        }}
        className="border p-2 rounded w-full mb-4"
      >
        <option value="">Selecione um cliente</option>
        {clientes
          .filter((c) =>
            c.nome.toLowerCase().includes(filtroCliente.toLowerCase()) ||
            (c.cpf || c.cpf_cnpj)?.replace(/\D/g, "").includes(filtroCliente.replace(/\D/g, ""))
          )
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} — {c.cpf || c.cpf_cnpj}
            </option>
          ))}
      </select>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="border p-2 rounded">
          <option value="">Forma de Pagamento</option>
          <option value="Dinheiro">Dinheiro</option>
          <option value="Cartão Crédito">Cartão Crédito</option>
          <option value="Cartão Débito">Cartão Débito</option>
          <option value="Pix">Pix</option>
        </select>
        <input
          type="text"
          placeholder="Endereço de Entrega"
          value={enderecoEntrega}
          onChange={(e) => setEnderecoEntrega(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)} className="border p-2 rounded">
          <option value="">Selecione um produto</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome} — R$ {p.preco} — Estoque: {p.estoque}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          placeholder="Qtd"
          value={quantidadeSelecionada}
          onChange={(e) => setQuantidadeSelecionada(e.target.value)}
          className="border p-2 rounded"
        />
        <button onClick={adicionarItem} className="bg-blue-500 text-white px-4 py-2 rounded">Adicionar Produto</button>
      </div>

      {itensPedido.length > 0 && (
        <ul className="mb-4">
          {itensPedido.map((item, i) => (
            <li key={i} className="flex justify-between items-center mb-2">
              <span>{item.produto.nome} — Qtd: {item.quantidade} — Total: R$ {(item.quantidade * item.produto.preco).toFixed(2)}</span>
              <button onClick={() => removerItem(i)} className="bg-red-500 text-white px-2 py-1 text-xs rounded">Remover</button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={criarOuAtualizarPedido} className="bg-blue-600 text-white px-4 py-2 rounded mb-6">
        {modoEdicao ? "Atualizar Pedido" : "Criar Pedido"}
      </button>

      <div className="flex gap-4 mb-4">
        <button onClick={exportarExcel} className="bg-green-700 text-white px-4 py-2 rounded">Exportar Excel</button>
        <button onClick={exportarPDF} className="bg-gray-800 text-white px-4 py-2 rounded">Exportar PDF</button>
      </div>

      <h3 className="text-xl font-bold mb-2">Pedidos Registrados</h3>
      <ul className="bg-white shadow rounded p-4">
        {pedidos.map((p) => (
          <li key={p.id} className="mb-4 border-b pb-2">
            <p><strong>ID:</strong> {p.id} | <strong>Cliente:</strong> {p.cliente?.nome || "N/A"}</p>
            <p><strong>Status:</strong> {p.status || "Pendente"}</p>
            <p><strong>Total:</strong> R$ {parseFloat(p.total || 0).toFixed(2)}</p>
            {p.itens && (
              <ul className="ml-4 mt-2 list-disc">
                {p.itens.map((item, i) => (
                  <li key={i}>
                    {item.produto?.nome || "Produto desconhecido"} — Qtd: {item.quantidade}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => editarPedido(p)} className="bg-yellow-500 text-white text-sm px-3 py-1 rounded">Editar</button>
              <button onClick={() => atualizarStatus(p, "ENTREGUE")} className="bg-green-600 text-white text-sm px-3 py-1 rounded">Entregue</button>
              <button onClick={() => atualizarStatus(p, "CANCELADO")} className="bg-gray-600 text-white text-sm px-3 py-1 rounded">Cancelar</button>
              <button onClick={() => deletarPedido(p.id)} className="bg-red-600 text-white text-sm px-3 py-1 rounded">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}