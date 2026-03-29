import { NavLink, useNavigate } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-sm font-semibold tracking-tight text-gray-800">
            Persa Industrial
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Sistema de cotizaciones
          </p>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`
            }
          >
            <span className="text-base">📋</span> Cotizaciones
          </NavLink>
          <NavLink
            to="/new"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`
            }
          >
            <span className="text-base">＋</span> Nueva cotización
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-gray-900 text-white font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`
            }
          >
            <span className="text-base">📦</span> Catálogo
          </NavLink>
        </nav>
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <p className="text-xs text-gray-300">v1.0</p>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Salir
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
