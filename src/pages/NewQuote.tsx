import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import logo from "../assets/logo.png";

import {
  createQuote,
  updateQuote,
  getQuotes,
  getClients,
  createClient,
  getSender,
  updateSender,
} from "../services/api";

interface Item {
  section: string;
  desc: string;
  qty: number;
  price: number;
}
interface Client {
  id: number;
  name: string;
  company?: string;
}
interface Sender {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
}

const inputCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";
export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
      {title}
    </p>
    {children}
  </div>
);
export const ItemRow = ({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: Item;
  index: number;
  onUpdate: (i: number, f: keyof Item, v: string | number) => void;
  onRemove: (i: number) => void;
}) => (
  <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-gray-100 last:border-0">
    <div className="col-span-4">
      <input
        value={item.desc}
        onChange={(e) => onUpdate(index, "desc", e.target.value)}
        placeholder="Descripción"
        className={inputCls}
      />
    </div>
    <div className="col-span-2">
      <input
        type="number"
        min="0"
        step="1"
        value={item.qty === 0 ? "" : item.qty}
        onChange={(e) =>
          onUpdate(
            index,
            "qty",
            e.target.value === "" ? 0 : Number(e.target.value),
          )
        }
        placeholder="0"
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-right w-full"
      />
    </div>
    <div className="col-span-3">
      <input
        type="number"
        min="0"
        step="0.01"
        value={item.price === 0 ? "" : item.price}
        onChange={(e) =>
          onUpdate(
            index,
            "price",
            e.target.value === "" ? 0 : Number(e.target.value),
          )
        }
        placeholder="0.00"
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-right w-full"
      />
    </div>
    <div className="col-span-2 text-right text-sm font-medium text-gray-700 pr-1">
      {(item.qty * item.price).toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
      })}
    </div>
    <div className="col-span-1 flex justify-center">
      <button
        onClick={() => onRemove(index)}
        className="text-gray-300 hover:text-red-400 text-xl leading-none"
      >
        ×
      </button>
    </div>
  </div>
);
export default function NewQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  const [sender, setSender] = useState<Sender>({
    id: 0,
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
  });
  const [editingSender, setEditingSender] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | "">("");
  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
  });
  const [useExisting, setUseExisting] = useState(false);
  const [maqBrand, setMaqBrand] = useState("");
  const [maqModel, setMaqModel] = useState("");
  const [maqType, setMaqType] = useState("");
  const [maqSerial, setMaqSerial] = useState("");
  const [maqHours, setMaqHours] = useState("");
  const [maqCondition, setMaqCondition] = useState("");
  const [delivery, setDelivery] = useState("");
  const [validity, setValidity] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Borrador");
  const [services, setServices] = useState<Item[]>([]);
  const [parts, setParts] = useState<Item[]>([]);
  const [advance, setAdvance] = useState<number>(0);
  const [folio, setFolio] = useState(() => "COT-" + Date.now());
  useEffect(() => {
    getSender().then((r) => setSender(r.data));
    getClients().then((r) => setClients(r.data));
    if (id) {
      getQuotes().then((r) => {
        const q = r.data.find((q: { id: number }) => q.id === Number(id));
        if (!q) return;
        setFolio(q.folio);
        setClientId(q.clientId);
        setUseExisting(true);
        setMaqBrand(q.maqBrand || "");
        setMaqModel(q.maqModel || "");
        setMaqType(q.maqType || "");
        setMaqSerial(q.maqSerial || "");
        setMaqHours(q.maqHours || "");
        setMaqCondition(q.maqCondition || "");
        setDelivery(q.delivery || "");
        setValidity(q.validity || "");
        setNotes(q.notes || "");
        setStatus(q.status);
        setAdvance(q.advance || 0);
        setServices(
          q.items
            .filter((i: Item) => i.section === "servicio")
            .map(({ section, desc, qty, price }: Item) => ({
              section,
              desc,
              qty,
              price,
            })),
        );
        setParts(
          q.items
            .filter((i: Item) => i.section === "refaccion")
            .map(({ section, desc, qty, price }: Item) => ({
              section,
              desc,
              qty,
              price,
            })),
        );
      });
    }
  }, [id]);

  const addService = () =>
    setServices([
      ...services,
      { section: "servicio", desc: "", qty: 1, price: 0 },
    ]);
  const addPart = () =>
    setParts([...parts, { section: "refaccion", desc: "", qty: 1, price: 0 }]);
  const removeService = (i: number) =>
    setServices(services.filter((_, idx) => idx !== i));
  const removePart = (i: number) =>
    setParts(parts.filter((_, idx) => idx !== i));
  const updateService = (
    i: number,
    field: keyof Item,
    value: string | number,
  ) => {
    const copy = [...services];
    copy[i] = { ...copy[i], [field]: value };
    setServices(copy);
  };
  const updatePart = (i: number, field: keyof Item, value: string | number) => {
    const copy = [...parts];
    copy[i] = { ...copy[i], [field]: value };
    setParts(copy);
  };

  const allItems = [...services, ...parts];
  const subtotal = allItems.reduce((a, i) => a + i.qty * i.price, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const remaining = total - advance;
  const fmt = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

  const saveSender = async () => {
    await updateSender(sender);
    setEditingSender(false);
  };

  const save = async () => {
    let finalClientId = clientId;
    if (!useExisting) {
      if (!newClient.name) return alert("Ingresa el nombre del cliente");
      const r = await createClient(newClient);
      finalClientId = r.data.id;
    }
    if (!finalClientId) return alert("Selecciona o crea un cliente");
    const data = {
      clientId: finalClientId,
      folio,
      maqBrand,
      maqModel,
      maqType,
      maqSerial,
      maqHours,
      maqCondition,
      delivery,
      validity,
      notes,
      status,
      advance,
      items: allItems,
    };
    if (id) {
      await updateQuote(Number(id), data);
    } else {
      await createQuote(data);
    }
    navigate("/");
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl flex flex-col gap-4 min-h-screen">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {id ? "Editar cotización" : "Nueva cotización"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{folio}</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Remitente */}
        <Section title="Datos del remitente">
          {editingSender ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input
                    value={sender.name}
                    onChange={(e) =>
                      setSender({ ...sender, name: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Empresa</label>
                  <input
                    value={sender.company}
                    onChange={(e) =>
                      setSender({ ...sender, company: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input
                    value={sender.phone}
                    onChange={(e) =>
                      setSender({ ...sender, phone: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Correo</label>
                  <input
                    value={sender.email}
                    onChange={(e) =>
                      setSender({ ...sender, email: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Dirección</label>
                  <input
                    value={sender.address}
                    onChange={(e) =>
                      setSender({ ...sender, address: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingSender(false)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveSender}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
                >
                  Guardar datos
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-start">
                <img src={logo} alt="Logo" className="h-20 object-contain" />
                <div className="text-sm text-gray-700 flex flex-col gap-0.5">
                  {sender.name ? (
                    <span className="font-medium">{sender.name}</span>
                  ) : (
                    <span className="text-gray-400">Sin nombre</span>
                  )}
                  {sender.company && <span>{sender.company}</span>}
                  {sender.phone && <span>{sender.phone}</span>}
                  {sender.email && <span>{sender.email}</span>}
                  {sender.address && <span>{sender.address}</span>}
                  <span className="text-gray-400 mt-1">
                    Folio:{" "}
                    <span className="text-blue-600 font-medium">{folio}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingSender(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Editar
              </button>
            </div>
          )}
        </Section>

        {/* Cliente */}
        <Section title="Datos del cliente">
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
              className={inputCls}
            >
              <option value="">Selecciona un cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.company ? ` — ${c.company}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Empresa</label>
                <input
                  value={newClient.company}
                  onChange={(e) =>
                    setNewClient({ ...newClient, company: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Correo</label>
                <input
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Dirección</label>
                <input
                  value={newClient.address}
                  onChange={(e) =>
                    setNewClient({ ...newClient, address: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </Section>

        {/* Maquinaria */}
        <Section title="Maquinaria">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Marca</label>
              <input
                value={maqBrand}
                onChange={(e) => setMaqBrand(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Modelo</label>
              <input
                value={maqModel}
                onChange={(e) => setMaqModel(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <input
                value={maqType}
                onChange={(e) => setMaqType(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Número de serie</label>
              <input
                value={maqSerial}
                onChange={(e) => setMaqSerial(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Horómetro</label>
              <input
                value={maqHours}
                onChange={(e) => setMaqHours(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Condiciones actuales</label>
              <textarea
                value={maqCondition}
                onChange={(e) => setMaqCondition(e.target.value)}
                rows={2}
                className={inputCls}
              />
            </div>
          </div>
        </Section>

        {/* Servicios */}
        <Section title="Servicios">
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-4 text-xs text-gray-400 font-medium">
              Descripción
            </div>
            <div className="col-span-2 text-xs text-gray-400 font-medium text-right">
              Cantidad
            </div>
            <div className="col-span-3 text-xs text-gray-400 font-medium text-right">
              Precio unit.
            </div>
            <div className="col-span-2 text-xs text-gray-400 font-medium text-right">
              Total
            </div>
            <div className="col-span-1"></div>
          </div>
          {services.map((item, i) => (
            <ItemRow
              key={i}
              item={item}
              index={i}
              onUpdate={updateService}
              onRemove={removeService}
            />
          ))}
          {services.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">
              Sin servicios agregados
            </p>
          )}
          <button
            onClick={addService}
            className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            + Agregar servicio
          </button>
        </Section>

        {/* Refacciones */}
        <Section title="Refacciones">
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-4 text-xs text-gray-400 font-medium">
              Descripción
            </div>
            <div className="col-span-2 text-xs text-gray-400 font-medium text-right">
              Cantidad
            </div>
            <div className="col-span-3 text-xs text-gray-400 font-medium text-right">
              Precio unit.
            </div>
            <div className="col-span-2 text-xs text-gray-400 font-medium text-right">
              Total
            </div>
            <div className="col-span-1"></div>
          </div>
          {parts.map((item, i) => (
            <ItemRow
              key={i}
              item={item}
              index={i}
              onUpdate={updatePart}
              onRemove={removePart}
            />
          ))}
          {parts.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">
              Sin refacciones agregadas
            </p>
          )}
          <button
            onClick={addPart}
            className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
          >
            + Agregar refacción
          </button>
        </Section>

        {/* Condiciones */}
        <Section title="Condiciones y notas">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Tiempo de entrega</label>
              <input
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Vigencia de cotización</label>
              <input
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="relative">
              <label className={labelCls}>
                Estado
                <span
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-xs cursor-help"
                >
                  ?
                </span>
              </label>
              {showTooltip && (
                <div className="absolute bottom-full left-0 mb-2 z-10 w-64 bg-white border border-gray-200 text-gray-600 text-xs rounded-xl p-3 leading-relaxed shadow-md">
                  <strong className="block text-gray-800 mb-1.5 font-semibold">
                    Estados de la cotización
                  </strong>
                  <div className="flex flex-col gap-1">
                    <span>
                      <span className="font-medium text-gray-700">
                        Borrador
                      </span>{" "}
                      — en proceso, no lista
                    </span>
                    <span>
                      <span className="font-medium text-gray-700">
                        Pendiente
                      </span>{" "}
                      — lista, sin enviar
                    </span>
                    <span>
                      <span className="font-medium text-gray-700">Enviada</span>{" "}
                      — enviada al cliente
                    </span>
                    <span>
                      <span className="font-medium text-gray-700">
                        Aprobada
                      </span>{" "}
                      — cliente aceptó
                    </span>
                    <span>
                      <span className="font-medium text-gray-700">
                        Rechazada
                      </span>{" "}
                      — cliente rechazó
                    </span>
                  </div>
                </div>
              )}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                <option>Borrador</option>
                <option>Pendiente</option>
                <option>Enviada</option>
                <option>Aprobada</option>
                <option>Rechazada</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Notas adicionales</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={inputCls}
              />
            </div>
          </div>
        </Section>

        {/* Totales */}
        <Section title="Resumen de pago">
          <div className="flex flex-col gap-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>IVA (16%)</span>
              <span>{fmt(iva)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2 mt-1">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
              <span>Anticipo</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={advance === 0 ? "" : advance}
                onChange={(e) =>
                  setAdvance(e.target.value === "" ? 0 : Number(e.target.value))
                }
                placeholder="0.00"
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-right w-36 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex justify-between text-sm font-semibold text-blue-600 border-t border-gray-200 pt-2 mt-1">
              <span>Resto a pagar</span>
              <span>{fmt(remaining)}</span>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={save}
              className="px-6 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              {id ? "Guardar cambios" : "Generar cotización"}
            </button>
          </div>
        </Section>
      </div>
    </Layout>
  );
}
