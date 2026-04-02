import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const login = (username: string, password: string) =>
  api.post("/login", { username, password });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
export const getQuotes = () => api.get("/quotes");
export const createQuote = (data: object) => api.post("/quotes", data);
export const updateQuote = (id: number, data: object) =>
  api.put(`/quotes/${id}`, data);
export const getClients = () => api.get("/clients");
export const createClient = (data: object) => api.post("/clients", data);
export const getCatalog = () => api.get("/catalog");
export const createCatalogItem = (data: object) => api.post("/catalog", data);
export const getSender = () => api.get("/sender");
export const updateSender = (data: object) => api.put("/sender", data);
export const deleteQuote = (id: number) => api.delete(`/quotes/${id}`);
export const updateCatalogItem = (id: number, data: object) =>
  api.put(`/catalog/${id}`, data);
export const deleteCatalogItem = (id: number) => api.delete(`/catalog/${id}`);
export const updateClient = (id: number, data: object) => api.put(`/clients/${id}`, data);
export const deleteClient = (id: number) => api.delete(`/clients/${id}`);
