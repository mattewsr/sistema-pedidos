import { useEffect, useState } from "react";
import axios from "axios";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    categoria: "",
  });

  const isEditando = form.id !== null;

  useEffect(() => {
    fetchProdutos();
  }, []);

  async function fetchProdutos() {
    try {
      const response = await axios.get("http://localhost:3000/produtos");
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (isEditando) {
        await axios.put(`http://localhost:3000/produtos/${form.id}`, {
          ...form,
          preco: parseFloat(form.preco),
          estoque: parseInt(form.estoque),
        });
      } else {
        await axios.post("http://localhost:3000/produtos", {
          ...form,
          preco: parseFloat(form.preco),
          estoque: parseInt(form.estoque),
        });
      }

      resetForm();
      fetchProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  }

  function resetForm() {
    setForm({
      id: null,
      nome: "",
      descricao: "",
      preco: "",
      estoque: "",
      categoria: "",
    });
  }

  function editarProduto(produto) {
    setForm({ ...produto });
  }

  async function excluirProduto(id) {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await axios.delete(`http://localhost:3000/produtos/${id}`);
        fetchProdutos();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Produtos</h1>

      {/* Formulário */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          step="0.01"
          placeholder="Preço"
          value={form.preco}
          onChange={(e) => setForm({ ...form, preco: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Estoque"
          value={form.estoque}
          onChange={(e) => setForm({ ...form, estoque: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Categoria"
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        />
        <div className="flex gap-2 col-span-full">
          <button
            type="submit"
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 flex-1"
          >
            {isEditando ? "Atualizar Produto" : "Cadastrar Produto"}
          </button>
          {isEditando && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2 border">Nome</th>
              <th className="px-4 py-2 border">Descrição</th>
              <th className="px-4 py-2 border">Preço</th>
              <th className="px-4 py-2 border">Estoque</th>
              <th className="px-4 py-2 border">Categoria</th>
              <th className="px-4 py-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{produto.nome}</td>
                <td className="px-4 py-2 border">{produto.descricao}</td>
                <td className="px-4 py-2 border">R$ {produto.preco}</td>
                <td className="px-4 py-2 border">{produto.estoque}</td>
                <td className="px-4 py-2 border">{produto.categoria}</td>
                <td className="px-4 py-2 border space-x-2">
                  <button
                    onClick={() => editarProduto(produto)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => excluirProduto(produto.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
