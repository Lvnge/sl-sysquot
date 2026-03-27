export interface QuoteItem {
  desc: string;
  type: string;
  qty: number;
  price: number;
}
export interface Quote {
  id: number;
  folio: string;
  status: string;
  createdAt: string;
  clientId: number;
  client: { name: string; company?: string; phone?: string; email?: string };
  maqType?: string;
  maqModel?: string;
  maqSerial?: string;
  maqHours?: string;
  diagnosis?: string;
  delivery?: string;
  validity?: string;
  notes?: string;
  items: QuoteItem[];
}
