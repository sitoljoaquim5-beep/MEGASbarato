const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({ secret: "segredo", resave: false, saveUninitialized: true }));

// ================= CLIENTE =================

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { erro: null });
});

app.post("/login", (req, res) => {
  const { numero } = req.body;
  if (!numero) {
    return res.render("login", { erro: "Por favor digite o número" });
  }
  req.session.cliente = numero;
  res.redirect("/cliente");
});

app.get("/cliente", (req, res) => {
  if (!req.session.cliente) return res.redirect("/login");

  const pacotes = [
    { nome: "600MB", preco: "10 MT" },
    { nome: "1GB", preco: "17 MT" },
    { nome: "2GB", preco: "34 MT" },
    { nome: "3GB", preco: "51 MT" },
    { nome: "4GB", preco: "68 MT" },
    { nome: "5GB", preco: "85 MT" },
    { nome: "6GB", preco: "102 MT" },
    { nome: "7GB", preco: "119 MT" },
    { nome: "8GB", preco: "136 MT" },
    { nome: "9GB", preco: "153 MT" },
    { nome: "10GB", preco: "170 MT" },
    { nome: "15GB", preco: "255 MT" },
    { nome: "20GB", preco: "340 MT" },
  ];

  res.render("cliente", { numero: req.session.cliente, pacotes });
});

app.post("/pedido", upload.single("comprovativo"), (req, res) => {
  const pedidos = fs.existsSync("./data/pedidos.json")
    ? JSON.parse(fs.readFileSync("./data/pedidos.json"))
    : [];

  const { pacote } = req.body;
  const numero = req.session.cliente;

  pedidos.push({
    id: Date.now(),
    numero,
    pacote,
    comprovativo: req.file ? req.file.filename : "Whatsapp",
    status: "Pendente",
  });

  fs.writeFileSync("./data/pedidos.json", JSON.stringify(pedidos, null, 2));
  res.send("Pedido enviado com sucesso!");
});

// ================= ADMINISTRADOR =================
const ADMIN_USER = "848435732";
const ADMIN_PASS = "25122001";

app.get("/login-admin", (req, res) => {
  res.render("login_admin", { erro: null });
});

app.post("/login-admin", (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario === ADMIN_USER && senha === ADMIN_PASS) {
    req.session.admin = true;
    res.redirect("/admin");
  } else {
    res.render("login_admin", { erro: "Usuário ou senha inválidos" });
  }
});

app.get("/admin", (req, res) => {
  if (!req.session.admin) return res.redirect("/login-admin");

  const pedidos = fs.existsSync("./data/pedidos.json")
    ? JSON.parse(fs.readFileSync("./data/pedidos.json"))
    : [];

  res.render("admin", { pedidos });
});

app.post("/aprovar/:id", (req, res) => {
  const id = req.params.id;
  let pedidos = fs.existsSync("./data/pedidos.json")
    ? JSON.parse(fs.readFileSync("./data/pedidos.json"))
    : [];

  pedidos = pedidos.map(p => {
    if (p.id == id) p.status = "Aprovado";
    return p;
  });

  fs.writeFileSync("./data/pedidos.json", JSON.stringify(pedidos, null, 2));
  res.redirect("/admin");
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
