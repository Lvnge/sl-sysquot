import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();
app.use(cors());
app.use(express.json());

// Sender Profile
app.get("/sender", async (req, res) => {
  let sender = await prisma.senderProfile.findFirst();
  if (!sender) sender = await prisma.senderProfile.create({ data: {} });
  res.json(sender);
});
app.put("/sender", async (req, res) => {
  let sender = await prisma.senderProfile.findFirst();
  if (!sender) sender = await prisma.senderProfile.create({ data: {} });
  const updated = await prisma.senderProfile.update({
    where: { id: sender.id },
    data: req.body,
  });
  res.json(updated);
});

// Clientes
app.get("/clients", async (req, res) => {
  const clients = await prisma.client.findMany();
  res.json(clients);
});
app.post("/clients", async (req, res) => {
  const client = await prisma.client.create({ data: req.body });
  res.json(client);
});

// Catálogo
app.get("/catalog", async (req, res) => {
  const items = await prisma.catalogItem.findMany();
  res.json(items);
});
app.post("/catalog", async (req, res) => {
  const item = await prisma.catalogItem.create({ data: req.body });
  res.json(item);
});

// Cotizaciones
app.get("/quotes", async (req, res) => {
  const quotes = await prisma.quote.findMany({
    include: { client: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(quotes);
});
app.post("/quotes", async (req, res) => {
  const { items, ...data } = req.body;
  const quote = await prisma.quote.create({
    data: { ...data, items: { create: items } },
    include: { client: true, items: true },
  });
  res.json(quote);
});
app.put("/quotes/:id", async (req, res) => {
  const { items, ...data } = req.body;
  await prisma.quoteItem.deleteMany({
    where: { quoteId: Number(req.params.id) },
  });
  const quote = await prisma.quote.update({
    where: { id: Number(req.params.id) },
    data: { ...data, items: { create: items } },
    include: { client: true, items: true },
  });
  res.json(quote);
});
//Borrar cotizaciones
app.delete("/quotes/:id", async (req, res) => {
  await prisma.quoteItem.deleteMany({
    where: { quoteId: Number(req.params.id) },
  });
  await prisma.quote.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
app.listen(3000, () => console.log("Server corriendo en puerto 3000"));

//Editar items del catalogo
app.put("/catalog/:id", async (req, res) => {
  const item = await prisma.catalogItem.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(item);
});
//Borrar items del catalogo
app.delete("/catalog/:id", async (req, res) => {
  await prisma.catalogItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});
