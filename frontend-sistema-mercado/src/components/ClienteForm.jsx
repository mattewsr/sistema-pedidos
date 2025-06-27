import { useState, useEffect } from "react";
import axios from "axios";

export default function ClienteForm({ cliente, onSuccess }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    endereco: ""
  });

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        cpf: cliente.cpf_cnpj || cliente.cpf || "",
        endereco: cliente.endereco || ""
      });
    } else {
      setForm({ nome: "", email: "", telefone: "", cpf: "", endereco: "" });
    }
  }, [cliente]);

  const formatarNome = (nome) => {
    return nome
      .toLowerCase()
      .replace(/(^|\s)\S/g, (letra) => letra.toUpperCase())
      .slice(0, 100);
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
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nome = formatarNome(form.nome);
    const cpf_cnpj = formatarCPF(form.cpf);
    const telefone = form.telefone ? formatarTelefone(form.telefone) : "";
    const email = form.email.trim();
    const endereco = form.endereco.trim();

    if (!validarEmail(email)) {
      alert("Email inválido. Deve conter @ e domínio.");
      return;
    }

    const clienteData = { nome, email, telefone, cpf_cnpj, endereco };

    try {
      if (cliente) {
        await axios.put(`http://localhost:3000/clientes/${cliente.id}`, clienteData);
      } else {
        await axios.post("http://localhost:3000/clientes", clienteData);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: formatarNome(e.target.value) })}
          className="border p-2 rounded"
          required
          maxLength={100}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Telefone"
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: formatarTelefone(e.target.value) })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="CPF"
          value={form.cpf}
          onChange={(e) => setForm({ ...form, cpf: formatarCPF(e.target.value) })}
          className="border p-2 rounded"
          required
          maxLength={14}
        />
        <input
          type="text"
          placeholder="Endereço (opcional)"
          value={form.endereco}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          className="border p-2 rounded col-span-2"
          maxLength={200}
        />
      </div>
      <button
        type="submit"
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {cliente ? "Atualizar" : "Adicionar"} Cliente
      </button>
    </form>
  );
}
