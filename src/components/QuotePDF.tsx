import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../assets/logo.png";
import type { Quote, QuoteItem } from "../types";

interface Sender {
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
}

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 110, color: "#888" },
  value: { flex: 1 },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", padding: 5 },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  c1: { flex: 4 },
  c2: { flex: 1, textAlign: "right" },
  c3: { flex: 1, textAlign: "right" },
  c4: { flex: 1, textAlign: "right" },
  totals: { marginTop: 10, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", marginBottom: 3 },
  totalLabel: {
    width: 100,
    color: "#666",
    textAlign: "right",
    marginRight: 16,
  },
  totalValue: { width: 80, textAlign: "right" },
  grandTotal: { fontSize: 12, fontWeight: "bold" },
  highlight: { color: "#1d4ed8" },
  footer: { marginTop: 30, color: "#aaa", fontSize: 9, textAlign: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  folio: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1d4ed8",
    marginBottom: 4,
  },
  twoCol: { flexDirection: "row", gap: 20 },
  col: { flex: 1 },
});

const fmt = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const Field = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  ) : null;

const ItemTable = ({ title, items }: { title: string; items: QuoteItem[] }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    <View style={s.tableHeader}>
      <Text style={s.c1}>Descripción</Text>
      <Text style={s.c2}>Cant.</Text>
      <Text style={s.c3}>Precio unit.</Text>
      <Text style={s.c4}>Total</Text>
    </View>
    {items.map((item, i) => (
      <View style={s.tableRow} key={i}>
        <Text style={s.c1}>{item.desc}</Text>
        <Text style={s.c2}>{item.qty}</Text>
        <Text style={s.c3}>{fmt(item.price)}</Text>
        <Text style={s.c4}>{fmt(item.qty * item.price)}</Text>
      </View>
    ))}
    {items.length === 0 && (
      <View style={s.tableRow}>
        <Text style={{ color: "#aaa" }}>Sin conceptos</Text>
      </View>
    )}
  </View>
);

export default function QuotePDF({
  quote,
  sender,
}: {
  quote: Quote;
  sender?: Sender;
}) {
  const services = quote.items.filter((i) => i.section === "servicio");
  const parts = quote.items.filter((i) => i.section === "refaccion");
  const subtotal = quote.items.reduce((a, i) => a + i.qty * i.price, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const advance = quote.advance || 0;
  const remaining = total - advance;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.headerRow}>
          <View>
            <Image src={logo} style={{ width: 100, marginBottom: 6 }} />
            {sender && (
              <View>
                {sender.company ? (
                  <Text style={{ fontWeight: "bold", fontSize: 11 }}>
                    {sender.company}
                  </Text>
                ) : null}
                {sender.name ? (
                  <Text style={{ color: "#555" }}>{sender.name}</Text>
                ) : null}
                {sender.phone ? (
                  <Text style={{ color: "#555" }}>{sender.phone}</Text>
                ) : null}
                {sender.email ? (
                  <Text style={{ color: "#555" }}>{sender.email}</Text>
                ) : null}
                {sender.address ? (
                  <Text style={{ color: "#555" }}>{sender.address}</Text>
                ) : null}
              </View>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.folio}>{quote.folio}</Text>
            <Text style={{ color: "#888" }}>
              {new Date(quote.createdAt).toLocaleDateString("es-MX")}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 9, color: "#888" }}>
              Estado: {quote.status}
            </Text>
          </View>
        </View>

        <View style={[s.section, s.twoCol]}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Cliente</Text>
            <Field label="Nombre" value={quote.client.name} />
            <Field label="Empresa" value={quote.client.company} />
            <Field label="Teléfono" value={quote.client.phone} />
            <Field label="Correo" value={quote.client.email} />
            <Field label="Dirección" value={quote.client.address} />
          </View>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Maquinaria</Text>
            <Field label="Marca" value={quote.maqBrand} />
            <Field label="Modelo" value={quote.maqModel} />
            <Field label="Tipo" value={quote.maqType} />
            <Field label="No. serie" value={quote.maqSerial} />
            <Field label="Horómetro" value={quote.maqHours} />
            <Field label="Condiciones" value={quote.maqCondition} />
          </View>
        </View>

        {services.length > 0 && (
          <ItemTable title="Servicios" items={services} />
        )}
        {parts.length > 0 && <ItemTable title="Refacciones" items={parts} />}

        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>IVA (16%)</Text>
            <Text style={s.totalValue}>{fmt(iva)}</Text>
          </View>
          <View
            style={[
              s.totalRow,
              {
                borderTopWidth: 1,
                borderTopColor: "#eee",
                paddingTop: 4,
                marginTop: 2,
              },
            ]}
          >
            <Text style={[s.totalLabel, s.grandTotal]}>Total</Text>
            <Text style={[s.totalValue, s.grandTotal]}>{fmt(total)}</Text>
          </View>
          {advance > 0 && (
            <>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Anticipo</Text>
                <Text style={s.totalValue}>{fmt(advance)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={[s.totalLabel, s.highlight]}>Resto a pagar</Text>
                <Text style={[s.totalValue, s.highlight]}>
                  {fmt(remaining)}
                </Text>
              </View>
            </>
          )}
        </View>

        {(quote.delivery || quote.validity || quote.notes) && (
          <View style={[s.section, { marginTop: 20 }]}>
            <Text style={s.sectionTitle}>Condiciones</Text>
            <Field label="Entrega" value={quote.delivery} />
            <Field label="Vigencia" value={quote.validity} />
            <Field label="Notas" value={quote.notes} />
          </View>
        )}

        <Text style={s.footer}>
          {sender?.company || "Persa Industrial"} — Documento generado el{" "}
          {new Date().toLocaleDateString("es-MX")}
        </Text>
      </Page>
    </Document>
  );
}
