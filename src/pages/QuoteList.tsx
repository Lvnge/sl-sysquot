import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getQuotes, getSender, deleteQuote } from "../services/api";
import type { Quote } from "../types";
import { MagnifyingGlass, Plus } from "phosphor-react";

const statusStyle: Record<string, string> = {
  Borrador: "bg-gray-100 text-gray-600",
  Pendiente: "bg-amber-100 text-amber-800",
  Enviada: "bg-blue-100 text-blue-800",
  Aprobada: "bg-green-100 text-green-700",
  Rechazada: "bg-red-100 text-red-600",
};

const statusColors: Record<string, string> = {
  Borrador:
    "bg-gray-50 border-gray-200 text-gray-600 border-l-4 border-l-gray-400",
  Pendiente:
    "bg-amber-50 border-amber-200 text-amber-800 border-l-4 border-l-amber-400",
  Enviada:
    "bg-blue-50 border-blue-200 text-blue-800 border-l-4 border-l-blue-400",
  Aprobada:
    "bg-green-50 border-green-200 text-green-700 border-l-4 border-l-green-500",
  Rechazada:
    "bg-red-50 border-red-200 text-red-600 border-l-4 border-l-red-400",
};

interface Sender {
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
}

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
const quoteTotal = (items: Quote["items"]) =>
  items.reduce((a, i) => a + i.qty * i.price, 0) * 1.16;

export default function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [sender, setSender] = useState<Sender | undefined>(undefined);
  const [generatingPDF, setGeneratingPDF] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterMonth, setFilterMonth] = useState("Todos");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const handleDelete = async (id: number, folio: string) => {
    if (
      !confirm(
        `¿Eliminar cotización ${folio}? Esta acción no se puede deshacer.`,
      )
    )
      return;
    await deleteQuote(id);
    setQuotes(quotes.filter((q) => q.id !== id));
  };

  useEffect(() => {
    Promise.all([
      getQuotes().then((r) => setQuotes(r.data)),
      getSender().then((r) => setSender(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterMonth]);

  const now = new Date();
  const monthlyIncome = quotes
    .filter((q) => {
      const d = new Date(q.createdAt);
      return (
        q.status === "Aprobada" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((a, q) => a + quoteTotal(q.items), 0);

  const statuses = [
    "Borrador",
    "Pendiente",
    "Enviada",
    "Aprobada",
    "Rechazada",
  ];
  const countByStatus = (s: string) =>
    quotes.filter((q) => q.status === s).length;

  const months = [
    ...new Set(
      quotes.map((q) => {
        const d = new Date(q.createdAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      }),
    ),
  ];

  const filteredQuotes = quotes.filter((q) => {
    const matchSearch =
      !search ||
      q.folio.toLowerCase().includes(search.toLowerCase()) ||
      q.client.name.toLowerCase().includes(search.toLowerCase()) ||
      q.maqType?.toLowerCase().includes(search.toLowerCase()) ||
      q.maqBrand?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Todos" || q.status === filterStatus;
    const matchMonth =
      filterMonth === "Todos" ||
      (() => {
        const d = new Date(q.createdAt);
        return (
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` ===
          filterMonth
        );
      })();
    return matchSearch && matchStatus && matchMonth;
  });

  const totalPages = Math.ceil(filteredQuotes.length / perPage);
  const paginatedQuotes = filteredQuotes.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  if (loading)
    return (
      <Layout>
        <div className="p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            <div className="col-span-2 grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex gap-4 px-4 py-3 border-b border-gray-100"
              >
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Cotizaciones
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredQuotes.length} de {quotes.length} cotización
              {quotes.length !== 1 ? "es" : ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/new")}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-1">
              <Plus size={12} />
              <span>Nueva cotización</span>
            </div>
          </button>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
                Total en cotizaciones confirmadas
              </p>
              <p className="text-3xl font-semibold text-white tracking-tight">
                {fmt(monthlyIncome)}
              </p>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-600 capitalize">
                {now.toLocaleString("es-MX", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <span className="text-xs font-medium text-green-500">
                {
                  quotes.filter((q) => {
                    const d = new Date(q.createdAt);
                    return (
                      q.status === "Aprobada" &&
                      d.getMonth() === now.getMonth() &&
                      d.getFullYear() === now.getFullYear()
                    );
                  }).length
                }{" "}
                cotizaciones aprobadas
              </span>
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-5 gap-2">
            {statuses.map((s) => (
              <div
                key={s}
                className={`border rounded-xl p-3 ${statusColors[s]}`}
              >
                <p className="text-xs font-medium mb-1">{s}</p>
                <p className="text-2xl font-semibold">{countByStatus(s)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 items-center">
          <div className="flex flex-col gap-0.5 flex-1">
            <span className="text-xs text-gray-400 px-1 invisible">_</span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MagnifyingGlass size={16} />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por folio, cliente o maquinaria..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 px-1">Estado</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600"
            >
              <option>Todos</option>
              {[
                "Borrador",
                "Pendiente",
                "Enviada",
                "Aprobada",
                "Rechazada",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 px-1">Mes</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-600"
            >
              <option>Todos</option>
              {months.map((m) => {
                const [year, month] = m.split("-");
                const label = new Date(
                  Number(year),
                  Number(month) - 1,
                ).toLocaleString("es-MX", { month: "long", year: "numeric" });
                return (
                  <option key={m} value={m}>
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 px-1 invisible">_</span>
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("Todos");
                setFilterMonth("Todos");
              }}
              disabled={
                !search && filterStatus === "Todos" && filterMonth === "Todos"
              }
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                search || filterStatus !== "Todos" || filterMonth !== "Todos"
                  ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                  : "border-gray-100 text-gray-300 cursor-default"
              }`}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="text-left px-4 py-3">Folio</th>
                <th className="text-left px-4 py-3">Cliente</th>
                <th className="text-left px-4 py-3">Maquinaria</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedQuotes.map((q) => (
                <tr
                  key={q.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{q.folio}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{q.client.name}</div>
                    <div className="text-xs text-gray-400">
                      {q.client.company}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{q.maqType}</div>
                    <div className="text-xs text-gray-400">{q.maqModel}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {fmt(quoteTotal(q.items))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[q.status]}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/edit/${q.id}`)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={async () => {
                        setGeneratingPDF(q.id);
                        const { pdf } = await import("@react-pdf/renderer");
                        const { default: QuotePDF } =
                          await import("../components/QuotePDF");
                        const blob = await pdf(
                          <QuotePDF quote={q} sender={sender} />,
                        ).toBlob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${q.folio}.pdf`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setGeneratingPDF(null);
                      }}
                      disabled={generatingPDF === q.id}
                      className="text-sm text-green-600 hover:underline ml-3 disabled:text-gray-400 inline-block w-20 text-left"
                    >
                      {generatingPDF === q.id ? "Generando..." : "PDF"}
                    </button>
                    <button
                      onClick={() => handleDelete(q.id, q.folio)}
                      className="text-sm text-red-400 hover:underline ml-3"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    {quotes.length === 0
                      ? "No hay cotizaciones aún"
                      : "No hay cotizaciones que coincidan"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Página {page} de {totalPages} — {filteredQuotes.length}{" "}
                cotizaciones
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
      </div>
    </Layout>
  );
}
