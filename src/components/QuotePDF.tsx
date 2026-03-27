import {
  Image,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Quote, QuoteItem } from "../types";
import logo from "../assets/logo.png";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666" },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 3,
  },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 120, color: "#666" },
  value: { flex: 1 },
  table: { marginTop: 6 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 5 },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1, textAlign: "right" },
  totals: { marginTop: 10, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", gap: 40, marginBottom: 3 },
  totalLabel: { color: "#666" },
  totalValue: { width: 80, textAlign: "right" },
  grandTotal: { fontSize: 12, fontWeight: "bold" },
  footer: { marginTop: 30, color: "#999", fontSize: 9, textAlign: "center" },
});

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function QuotePDF({ quote }: { quote: Quote }) {
  const subtotal = quote.items.reduce((a, i) => a + i.qty * i.price, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Image src={logo} style={{ width: 120, marginBottom: 8 }} />
          <Text style={s.subtitle}>Cotización {quote.folio}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Cliente</Text>
          <View style={s.row}>
            <Text style={s.label}>Nombre</Text>
            <Text style={s.value}>{quote.client.name}</Text>
          </View>
          {quote.client.company && (
            <View style={s.row}>
              <Text style={s.label}>Empresa</Text>
              <Text style={s.value}>{quote.client.company}</Text>
            </View>
          )}
          {quote.client.phone && (
            <View style={s.row}>
              <Text style={s.label}>Teléfono</Text>
              <Text style={s.value}>{quote.client.phone}</Text>
            </View>
          )}
          {quote.client.email && (
            <View style={s.row}>
              <Text style={s.label}>Correo</Text>
              <Text style={s.value}>{quote.client.email}</Text>
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Maquinaria</Text>
          {quote.maqType && (
            <View style={s.row}>
              <Text style={s.label}>Tipo / marca</Text>
              <Text style={s.value}>{quote.maqType}</Text>
            </View>
          )}
          {quote.maqModel && (
            <View style={s.row}>
              <Text style={s.label}>Modelo</Text>
              <Text style={s.value}>{quote.maqModel}</Text>
            </View>
          )}
          {quote.maqSerial && (
            <View style={s.row}>
              <Text style={s.label}>No. serie</Text>
              <Text style={s.value}>{quote.maqSerial}</Text>
            </View>
          )}
          {quote.maqHours && (
            <View style={s.row}>
              <Text style={s.label}>Horas</Text>
              <Text style={s.value}>{quote.maqHours}</Text>
            </View>
          )}
          {quote.diagnosis && (
            <View style={s.row}>
              <Text style={s.label}>Diagnóstico</Text>
              <Text style={s.value}>{quote.diagnosis}</Text>
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Conceptos</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.col1}>Descripción</Text>
              <Text style={s.col2}>Tipo</Text>
              <Text style={s.col2}>Cant.</Text>
              <Text style={s.col3}>Precio</Text>
              <Text style={s.col4}>Subtotal</Text>
            </View>
            {quote.items.map((item: QuoteItem, i: number) => (
              <View style={s.tableRow} key={i}>
                <Text style={s.col1}>{item.desc}</Text>
                <Text style={s.col2}>{item.type}</Text>
                <Text style={s.col2}>{item.qty}</Text>
                <Text style={s.col3}>{fmt(item.price)}</Text>
                <Text style={s.col4}>{fmt(item.qty * item.price)}</Text>
              </View>
            ))}
          </View>
          <View style={s.totals}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Subtotal</Text>
              <Text style={s.totalValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>IVA 16%</Text>
              <Text style={s.totalValue}>{fmt(iva)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={[s.totalLabel, s.grandTotal]}>Total</Text>
              <Text style={[s.totalValue, s.grandTotal]}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        {(quote.delivery || quote.validity || quote.notes) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Condiciones</Text>
            {quote.delivery && (
              <View style={s.row}>
                <Text style={s.label}>Entrega</Text>
                <Text style={s.value}>{quote.delivery}</Text>
              </View>
            )}
            {quote.validity && (
              <View style={s.row}>
                <Text style={s.label}>Vigencia</Text>
                <Text style={s.value}>{quote.validity}</Text>
              </View>
            )}
            {quote.notes && (
              <View style={s.row}>
                <Text style={s.label}>Notas</Text>
                <Text style={s.value}>{quote.notes}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={s.footer}>
          Persa Industrial — Documento generado el{" "}
          {new Date().toLocaleDateString("es-MX")}
        </Text>
      </Page>
    </Document>
  );
}
