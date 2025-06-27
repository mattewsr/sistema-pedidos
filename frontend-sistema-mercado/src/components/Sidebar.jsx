import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    isActive
      ? "block p-2 bg-blue-600 text-white rounded"
      : "block p-2 hover:bg-blue-100 rounded";

  return (
    <div className="w-64 h-screen bg-white shadow p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Sistema Mercado</h1>
      <nav className="flex-1 space-y-2">
        <NavLink to="/" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/clientes" className={linkClass}>Clientes</NavLink>
        <NavLink to="/produtos" className={linkClass}>Produtos</NavLink>
        <NavLink to="/pedidos" className={linkClass}>Pedidos</NavLink>
      </nav>
      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
