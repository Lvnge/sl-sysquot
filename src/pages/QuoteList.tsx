import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getQuotes, getSender, deleteQuote } from "../services/api";
import type { Quote } from "../types";

const statusStyle: Record<string, string> = {
  Borrador: "bg-gray-100 text-gray-600",
  Pendiente: "bg-amber-100 text-amber-800",
  Enviada: "bg-blue-100 text-blue-800",
  Aprobada: "bg-green-100 text-green-700",
  Rechazada: "bg-red-100 text-red-600",
};
interface Sender {
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
}
export default function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const navigate = useNavigate();
  const [sender, setSender] = useState<Sender | undefined>(undefined);
  const [generatingPDF, setGeneratingPDF] = useState<number | null>(null);
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
    getQuotes().then((r) => setQuotes(r.data));
    getSender().then((r) => setSender(r.data));
  }, []);

  const total = (items: Quote["items"]) => {
    const sub = items.reduce((a, i) => a + i.qty * i.price, 0);
    return (sub * 1.16).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Cotizaciones
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {quotes.length} cotización{quotes.length !== 1 ? "es" : ""}{" "}
              registrada{quotes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => navigate("/new")}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nueva cotización
          </button>
        </div>
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
              {quotes.map((q) => (
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
                  <td className="px-4 py-3 font-medium">{total(q.items)}</td>
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
              {quotes.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No hay cotizaciones aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
