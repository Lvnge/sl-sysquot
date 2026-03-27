import { NavLink } from "react-router-dom";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-52 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-sm font-medium">⚙ Persa Industrial</h1>
          <p className="text-xs text-gray-400 mt-1">Sistema de cotizaciones</p>
        </div>
        <nav className="flex-1 p-2 flex flex-col gap-1 mt-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? "bg-gray-100 font-medium" : "text-gray-500 hover:bg-gray-50"}`
            }
          >
            📋 Cotizaciones
          </NavLink>
          <NavLink
            to="/new"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? "bg-gray-100 font-medium" : "text-gray-500 hover:bg-gray-50"}`
            }
          >
            ✚ Nueva cotización
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isActive ? "bg-gray-100 font-medium" : "text-gray-500 hover:bg-gray-50"}`
            }
          >
            📦 Catálogo
          </NavLink>
        </nav>
        <div className="p-3 border-t border-gray-200">
          <p className="text-xs text-gray-400">Persa Industrial v1.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
