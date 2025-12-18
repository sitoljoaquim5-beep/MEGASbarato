const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// CONFIG
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "megasbarato",
    resave: false,
    saveUninitialized: true,
  })
);

// PACOTES
const pacotes = [
  { nome: "600MB", preco: "10 MT" },
  { nome: "1GB", preco: "17 MT" },
  { nome: "2GB", preco: "34 MT" },
  { nome: "3GB", preco: "51 MT" },
  { nome: "4GB", preco: "68 MT" },
  { nome: "5GB", preco: "85 MT" },
  { nome: "10GB", preco: "170 MT" },
  { nome: "15GB", preco: "255 MT" },
  { nome: "20GB", preco: "340 MT" },
];

// ROTAS
app.get("/", (req, res) => {
  res.redirect("/login");
});

// LOGIN CLIENTE
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { numero } = req.body;
  if (!numero) {
    return res.send("Número obrigatório");
  }
  req.session.cliente = numero;
  res.redirect("/cliente");
});

// ÁREA DO CLIENTE
app.get("/cliente", (req, res) => {
  if (!req.session.cliente) {
    return res.redirect("/login");
  }

  res.render("cliente", {
    numero: req.session.cliente,
    pacotes,
  });
});

// START
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
