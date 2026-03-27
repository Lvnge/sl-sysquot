import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getQuotes } from "../services/api";
import { PDFDownloadLink } from "@react-pdf/renderer";
import QuotePDF from "../components/QuotePDF";
import type { Quote } from "../types";

const statusStyle: Record<string, string> = {
  Borrador: "bg-gray-100 text-gray-600",
  Pendiente: "bg-amber-100 text-amber-800",
  Enviada: "bg-blue-100 text-blue-800",
  Aprobada: "bg-green-100 text-green-700",
};

export default function QuoteList() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getQuotes().then((r) => setQuotes(r.data));
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
          <h2 className="text-base font-medium">Cotizaciones</h2>
          <button
            onClick={() => navigate("/new")}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
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
                    <PDFDownloadLink
                      document={<QuotePDF quote={q} />}
                      fileName={`${q.folio}.pdf`}
                      className="text-sm text-green-600 hover:underline ml-3"
                    >
                      PDF
                    </PDFDownloadLink>
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
