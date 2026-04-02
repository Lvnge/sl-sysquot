import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const app = express();
app.use(cors());
app.use(express.json());

const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No autorizado" });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
};

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  )
    return res.status(401).json({ error: "Credenciales incorrectas" });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});



app.get("/sender", auth, async (req, res) => {
  let sender = await prisma.senderProfile.findFirst();
  if (!sender) sender = await prisma.senderProfile.create({ data: {} });
  res.json(sender);
});
app.put("/sender", auth, async (req, res) => {
  let sender = await prisma.senderProfile.findFirst();
  if (!sender) sender = await prisma.senderProfile.create({ data: {} });
  const updated = await prisma.senderProfile.update({
    where: { id: sender.id },
    data: req.body,
  });
  res.json(updated);
});

app.get("/clients", auth, async (req, res) => {
  res.json(await prisma.client.findMany());
});
app.post("/clients", auth, async (req, res) => {
  res.json(await prisma.client.create({ data: req.body }));
});

app.get("/catalog", auth, async (req, res) => {
  res.json(await prisma.catalogItem.findMany());
});
app.post("/catalog", auth, async (req, res) => {
  res.json(await prisma.catalogItem.create({ data: req.body }));
});
app.put("/catalog/:id", auth, async (req, res) => {
  res.json(
    await prisma.catalogItem.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    }),
  );
});
app.delete("/catalog/:id", auth, async (req, res) => {
  await prisma.catalogItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

app.get("/quotes", auth, async (req, res) => {
  res.json(
    await prisma.quote.findMany({
      include: { client: true, items: true },
      orderBy: { createdAt: "desc" },
    }),
  );
});
app.post("/quotes", auth, async (req, res) => {
  const { items, ...data } = req.body;
  res.json(
    await prisma.quote.create({
      data: { ...data, items: { create: items } },
      include: { client: true, items: true },
    }),
  );
});
app.put("/quotes/:id", auth, async (req, res) => {
  const { items, ...data } = req.body;
  await prisma.quoteItem.deleteMany({
    where: { quoteId: Number(req.params.id) },
  });
  res.json(
    await prisma.quote.update({
      where: { id: Number(req.params.id) },
      data: { ...data, items: { create: items } },
      include: { client: true, items: true },
    }),
  );
});
app.delete("/quotes/:id", auth, async (req, res) => {
  await prisma.quoteItem.deleteMany({
    where: { quoteId: Number(req.params.id) },
  });
  await prisma.quote.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

app.put("/clients/:id", auth, async (req, res) => {
  const client = await prisma.client.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  })
  res.json(client)
})

app.delete("/clients/:id", auth, async (req, res) => {
  await prisma.client.delete({ where: { id: Number(req.params.id) } })
  res.json({ ok: true })
})

app.listen(3000, () => console.log("Server corriendo en puerto 3000"));
