import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3000" });

export const getQuotes = () => api.get("/quotes");
export const createQuote = (data) => api.post("/quotes", data);
export const updateQuote = (id, data) => api.put(`/quotes/${id}`, data);
export const getClients = () => api.get("/clients");
export const createClient = (data) => api.post("/clients", data);
export const getCatalog = () => api.get("/catalog");
export const createCatalogItem = (data) => api.post("/catalog", data);
