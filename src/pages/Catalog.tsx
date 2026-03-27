import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getCatalog, createCatalogItem } from "../services/api";

interface CatalogItem {
  id: number;
  name: string;
  type: string;
  price: number;
  desc?: string;
}

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    type: "servicio",
    price: 0,
    desc: "",
  });
  const [showing, setShowing] = useState(false);

  useEffect(() => {
    getCatalog().then((r) => setItems(r.data));
  }, []);

  const save = async () => {
    if (!form.name) return alert("Ingresa un nombre");
    const r = await createCatalogItem(form);
    setItems([...items, r.data]);
    setForm({ name: "", type: "servicio", price: 0, desc: "" });
    setShowing(false);
  };

  const filtered = items.filter((i) => filter === "all" || i.type === filter);
  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-medium">Catálogo</h2>
          <button
            onClick={() => setShowing(!showing)}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Agregar
          </button>
        </div>

        {showing && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
            <input
              placeholder="Nombre *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="servicio">Servicio</option>
              <option value="refaccion">Refacción</option>
            </select>
            <input
              type="number"
              placeholder="Precio (sin IVA)"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Descripción"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <div className="col-span-2 flex justify-end gap-2">
              <button
                onClick={() => setShowing(false)}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {["all", "servicio", "refaccion"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border ${filter === f ? "bg-blue-50 border-blue-300 text-blue-700 font-medium" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
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
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">
                {item.type}
              </p>
              <p className="text-sm font-medium mb-1">{item.name}</p>
              {item.desc && (
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              )}
              <p className="text-base font-medium text-blue-600 mt-3">
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
      </div>
    </Layout>
  );
}
