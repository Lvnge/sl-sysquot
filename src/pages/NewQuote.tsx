import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import {
  createQuote,
  updateQuote,
  getQuotes,
  getClients,
  createClient,
} from "../services/api";

interface Item {
  desc: string;
  type: string;
  qty: number;
  price: number;
}
interface Client {
  id: number;
  name: string;
  company?: string;
}

export default function NewQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | "">("");
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
  });
  const [useExisting, setUseExisting] = useState(false);
  const [maqType, setMaqType] = useState("");
  const [maqModel, setMaqModel] = useState("");
  const [maqSerial, setMaqSerial] = useState("");
  const [maqHours, setMaqHours] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [delivery, setDelivery] = useState("");
  const [validity, setValidity] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Borrador");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    getClients().then((r) => setClients(r.data));
    if (id) {
      getQuotes().then((r) => {
        const q = r.data.find((q: any) => q.id === Number(id));
        if (!q) return;
        setClientId(q.clientId);
        setUseExisting(true);
        setMaqType(q.maqType || "");
        setMaqModel(q.maqModel || "");
        setMaqSerial(q.maqSerial || "");
        setMaqHours(q.maqHours || "");
        setDiagnosis(q.diagnosis || "");
        setDelivery(q.delivery || "");
        setValidity(q.validity || "");
        setNotes(q.notes || "");
        setStatus(q.status);
        setItems(
          q.items.map(({ desc, type, qty, price }: Item) => ({
            desc,
            type,
            qty,
            price,
          })),
        );
      });
    }
  }, [id]);

  const addItem = () =>
    setItems([...items, { desc: "", type: "servicio", qty: 1, price: 0 }]);
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof Item, value: string | number) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    setItems(copy);
  };

  const subtotal = items.reduce((a, i) => a + i.qty * i.price, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const save = async () => {
    let finalClientId = clientId;
    if (!useExisting) {
      if (!newClient.name) return alert("Ingresa el nombre del cliente");
      const r = await createClient(newClient);
      finalClientId = r.data.id;
    }
    if (!finalClientId) return alert("Selecciona o crea un cliente");
    const folio = id ? undefined : "COT-" + Date.now();
    const data = {
      clientId: finalClientId,
      folio,
      maqType,
      maqModel,
      maqSerial,
      maqHours,
      diagnosis,
      delivery,
      validity,
      notes,
      status,
      items,
    };
    id ? await updateQuote(Number(id), data) : await createQuote(data);
    navigate("/");
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base font-medium">
            {id ? "Editar cotización" : "Nueva cotización"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/")}
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

        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-5">
          <div>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={!useExisting}
                  onChange={() => setUseExisting(false)}
                />{" "}
                Cliente nuevo
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={useExisting}
                  onChange={() => setUseExisting(true)}
                />{" "}
                Cliente existente
              </label>
            </div>
            {useExisting ? (
              <select
                value={clientId}
                onChange={(e) => setClientId(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full"
              >
                <option value="">Selecciona un cliente...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `— ${c.company}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Nombre *"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  placeholder="Empresa"
                  value={newClient.company}
                  onChange={(e) =>
                    setNewClient({ ...newClient, company: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  placeholder="Teléfono"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  placeholder="Correo"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-3">
              Maquinaria
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Tipo / marca"
                value={maqType}
                onChange={(e) => setMaqType(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Modelo / año"
                value={maqModel}
                onChange={(e) => setMaqModel(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Número de serie"
                value={maqSerial}
                onChange={(e) => setMaqSerial(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Horas de operación"
                value={maqHours}
                onChange={(e) => setMaqHours(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Diagnóstico / descripción del problema"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={2}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Servicios y refacciones
              </p>
              <button
                onClick={addItem}
                className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                + Agregar línea
              </button>
            </div>
            <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2 w-2/5">Descripción</th>
                  <th className="text-left px-3 py-2">Tipo</th>
                  <th className="text-left px-3 py-2">Cant.</th>
                  <th className="text-left px-3 py-2">Precio</th>
                  <th className="text-left px-3 py-2">Subtotal</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-2 py-1">
                      <input
                        value={item.desc}
                        onChange={(e) => updateItem(i, "desc", e.target.value)}
                        className="w-full text-sm px-2 py-1 rounded border-0 focus:ring-1 focus:ring-blue-300 outline-none"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(i, "type", e.target.value)}
                        className="text-sm px-2 py-1 rounded border border-gray-200"
                      >
                        <option value="servicio">Servicio</option>
                        <option value="refaccion">Refacción</option>
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          updateItem(i, "qty", Number(e.target.value))
                        }
                        className="w-16 text-sm px-2 py-1 rounded border border-gray-200 text-right"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(i, "price", Number(e.target.value))
                        }
                        className="w-24 text-sm px-2 py-1 rounded border border-gray-200 text-right"
                      />
                    </td>
                    <td className="px-2 py-1 font-medium">
                      {fmt(item.qty * item.price)}
                    </td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => removeItem(i)}
                        className="text-gray-300 hover:text-red-400 text-lg"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-400 text-xs"
                    >
                      Sin conceptos aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-end mt-3">
              <div className="text-sm flex flex-col gap-1 min-w-48">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>IVA 16%</span>
                  <span>{fmt(iva)}</span>
                </div>
                <div className="flex justify-between font-medium border-t border-gray-200 pt-1 mt-1">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-3">
              Condiciones
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Tiempo de entrega"
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Vigencia de cotización"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option>Borrador</option>
                <option>Pendiente</option>
                <option>Enviada</option>
                <option>Aprobada</option>
              </select>
              <textarea
                placeholder="Notas adicionales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm col-span-2"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
