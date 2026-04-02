import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getClients, updateClient, deleteClient } from "../services/api";

interface Client {
  id: number;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
}

const inputCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClients()
      .then((r) => setClients(r.data))
      .finally(() => setLoading(false));
  }, []);
  const openEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      company: c.company || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
    });
  };

  const save = async () => {
    if (!form.name) return alert("El nombre es requerido");
    const r = await updateClient(editingId!, form);
    setClients(clients.map((c) => (c.id === editingId ? r.data : c)));
    setEditingId(null);
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `¿Eliminar a ${name}? Si tiene cotizaciones asociadas no se podrá eliminar.`,
      )
    )
      return;
    try {
      await deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
    } catch {
      alert(
        "No se puede eliminar este cliente porque tiene cotizaciones asociadas.",
      );
    }
  };
  if (loading)
    return (
      <Layout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-6 px-4 py-3 border-b border-gray-100"
              >
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  return (
    <Layout>
      <div className="p-6 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Clientes</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {clients.length} cliente{clients.length !== 1 ? "s" : ""}{" "}
              registrado{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Teléfono</th>
                <th className="text-left px-4 py-3">Correo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.company || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      className="text-sm text-red-400 hover:underline ml-3"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No hay clientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de edición */}
        {editingId !== null && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 w-full max-w-md shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-semibold text-gray-800">
                  Editar cliente
                </p>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Nombre *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Empresa</label>
                  <input
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Correo</label>
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Dirección</label>
                  <input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={save}
                    className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
