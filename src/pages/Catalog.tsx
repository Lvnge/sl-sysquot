import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  getCatalog,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
} from "../services/api";
import { Plus } from "phosphor-react";

interface CatalogItem {
  id: number;
  name: string;
  type: string;
  price: number;
  desc?: string;
}

const inputCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

const emptyForm = { name: "", type: "servicio", price: 0, desc: "" };

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [showing, setShowing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 9;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCatalog()
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false));
  }, []);
  const handleFilter = (f: string) => {
    setFilter(f);
    setPage(1);
  };
  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowing(true);
  };
  const openEdit = (item: CatalogItem) => {
    setForm({
      name: item.name,
      type: item.type,
      price: item.price,
      desc: item.desc || "",
    });
    setEditingId(item.id);
    setShowing(true);
  };
  const cancel = () => {
    setShowing(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const save = async () => {
    if (!form.name) return alert("Ingresa un nombre");
    if (editingId !== null) {
      const r = await updateCatalogItem(editingId, form);
      setItems(items.map((i) => (i.id === editingId ? r.data : i)));
    } else {
      const r = await createCatalogItem(form);
      setItems([...items, r.data]);
    }
    cancel();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`))
      return;
    await deleteCatalogItem(id);
    setItems(items.filter((i) => i.id !== id));
  };

  const filtered = items.filter((i) => filter === "all" || i.type === filter);
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  if (loading)
    return (
      <Layout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2"
              >
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mt-2" />
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
            <h2 className="text-lg font-semibold text-gray-800">Catálogo</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {items.length} item{items.length !== 1 ? "s" : ""} registrado
              {items.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={openNew}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between gap-1">
              <Plus size={12} />
              <span>Agregar</span>
            </div>
          </button>
        </div>

        {showing && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              {editingId !== null ? "Editar item" : "Nuevo item"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={inputCls}
                >
                  <option value="servicio">Servicio</option>
                  <option value="refaccion">Refacción</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Precio (sin IVA)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price === 0 ? "" : form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                  placeholder="0.00"
                  className={inputCls + " text-right"}
                />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <input
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-1">
                <button
                  onClick={cancel}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                >
                  {editingId !== null ? "Guardar cambios" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {["all", "servicio", "refaccion"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f ? "bg-gray-900 border-gray-900 text-white font-medium" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {f === "all"
                ? "Todos"
                : f === "servicio"
                  ? "Servicios"
                  : "Refacciones"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {paginated.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${item.type === "servicio" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
                >
                  {item.type === "servicio" ? "Servicio" : "Refacción"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-1">
                {item.name}
              </p>
              {item.desc && (
                <p className="text-xs text-gray-400 leading-relaxed flex-1">
                  {item.desc}
                </p>
              )}
              <p className="text-base font-semibold text-gray-800 mt-3">
                {fmt(item.price)}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 col-span-3 py-12 text-center">
              No hay items en el catálogo
            </p>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs text-gray-400">
              Página {page} de {totalPages} — {filtered.length} items
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default transition-colors"
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${page === i + 1 ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-default transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
