import { useEffect, useState } from "react";
import axios from "axios";
import ClienteForm from "../components/ClienteForm";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [editingCliente, setEditingCliente] = useState(null);

  const formatarNome = (nome) => {
    return nome
      .toLowerCase()
      .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase())
      .slice(0, 100); // Limita a 100 caracteres
  };

  const formatarCPF = (cpf) => {
    const limpo = cpf.replace(/\D/g, "").slice(0, 11);
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatarTelefone = (telefone) => {
    const limpo = telefone.replace(/\D/g, "").slice(0, 11);
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const validarEmail = (email) => {
    return /.+@.+\..+/.test(email);
  };

  const fetchClientes = async () => {
    try {
      const res = await axios.get("http://localhost:3000/clientes");
      const clientesFormatados = res.data.map((cliente) => ({
        ...cliente,
        nome: formatarNome(cliente.nome),
        cpf: formatarCPF(cliente.cpf_cnpj),
        telefone: cliente.telefone ? formatarTelefone(cliente.telefone) : "",
        email: validarEmail(cliente.email) ? cliente.email : "Email inválido"
      }));
      setClientes(clientesFormatados);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Deseja realmente excluir este cliente?")) {
      await axios.delete(`http://localhost:3000/clientes/${id}`);
      fetchClientes();
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-blue-700">Clientes</h2>

    <ClienteForm
      cliente={editingCliente}
      onSuccess={() => {
        fetchClientes();
        setEditingCliente(null);
      }}
    />

    <table className="min-w-full bg-white border mt-6 shadow">
      <thead>
        <tr className="bg-blue-200">
          <th className="border px-4 py-2">ID</th>
          <th className="border px-4 py-2">Nome</th>
          <th className="border px-4 py-2">Email</th>
          <th className="border px-4 py-2">Telefone</th>
          <th className="border px-4 py-2">CPF</th>
          <th className="border px-4 py-2">Endereço</th>
          <th className="border px-4 py-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente) => (
          <tr key={cliente.id} className="hover:bg-gray-100">
            <td className="border px-4 py-2">{cliente.id}</td>
            <td className="border px-4 py-2">{cliente.nome}</td>
            <td className="border px-4 py-2">{cliente.email}</td>
            <td className="border px-4 py-2">{cliente.telefone}</td>
            <td className="border px-4 py-2">{cliente.cpf}</td>
            <td className="border px-4 py-2">{cliente.endereco || "—"}</td>
            <td className="border px-4 py-2 space-x-2">
              <button
                onClick={() => setEditingCliente(cliente)}
                className="bg-yellow-400 text-white px-2 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(cliente.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}
