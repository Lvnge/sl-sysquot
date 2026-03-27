import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3000" });

export const getQuotes = () => api.get("/quotes");
export const createQuote = (data: object) => api.post("/quotes", data);
export const updateQuote = (id: number, data: object) =>
  api.put(`/quotes/${id}`, data);
export const getClients = () => api.get("/clients");
export const createClient = (data: object) => api.post("/clients", data);
export const getCatalog = () => api.get("/catalog");
export const createCatalogItem = (data: object) => api.post("/catalog", data);
