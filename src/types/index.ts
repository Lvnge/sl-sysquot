export interface QuoteItem {
  section: string;
  desc: string;
  qty: number;
  price: number;
}
export interface Quote {
  id: number;
  folio: string;
  status: string;
  createdAt: string;
  clientId: number;
  client: {
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  maqBrand?: string;
  maqModel?: string;
  maqType?: string;
  maqSerial?: string;
  maqHours?: string;
  maqCondition?: string;
  delivery?: string;
  validity?: string;
  notes?: string;
  advance?: number;
  items: QuoteItem[];
}
