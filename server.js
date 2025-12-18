const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const session = require("express-session");

const app = express();

app.use(session({ secret:"megasbarato", resave:false, saveUninitialized:true }));
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended:true }));

// Storage multer
const storage = multer.diskStorage({
  destination:"uploads/",
  filename:(req,file,cb)=>{ cb(null, Date.now()+"-"+file.originalname); }
});
const upload = multer({ storage });

// Base de dados
const DB = "./data/pedidos.json";
if(!fs.existsSync(DB)) fs.writeFileSync(DB,"[]");
function lerPedidos(){ return JSON.parse(fs.readFileSync(DB)); }
function salvarPedidos(pedidos){ fs.writeFileSync(DB, JSON.stringify(pedidos,null,2)); }

// Pacotes
const pacotes = [
  "600MB - 10 MT","1GB - 17 MT","2GB - 34 MT","3GB - 51 MT",
  "4GB - 68 MT","5GB - 85 MT","6GB - 102 MT","7GB - 119 MT",
  "8GB - 136 MT","9GB - 153 MT","10GB - 170 MT",
  "15GB - 255 MT","20GB - 340 MT",
  "1200MB - 20 MT","1500MB - 25 MT","1800MB - 30 MT",
  "2450MB - 40 MT","4900MB - 80 MT","8300MB - 140 MT"
];

// Credenciais admin
const adminUser = { usuario:"848435732", senha:"25122001" };

// Rotas
app.get("/", (req,res)=>{ res.render("index"); });

// Login cliente
app.get("/login-cliente",(req,res)=>{ res.render("login"); });
app.post("/login-cliente",(req,res)=>{
  req.session.numero = req.body.numero;
  res.redirect("/cliente");
});

// Área cliente
app.get("/cliente",(req,res)=>{
  if(!req.session.numero) return res.redirect("/login-cliente");
  const pedidos = lerPedidos().filter(p=>p.numero===req.session.numero);
  res.render("cliente",{ pacotes, pedidos, numero:req.session.numero });
});

// Criar pedido
app.post("/pedido", upload.single("comprovativo"), (req,res)=>{
  const pedidos = lerPedidos();
  if(req.body.modo==="site" && !req.file) return res.send("Erro: envie o comprovativo.");
  pedidos.push({
    numero: req.body.numero,               
    numero_destino: req.body.numero_destino, 
    pacote: req.body.pacote,
    comprovativo: req.body.modo==="site"? req.file.filename : "WHATSAPP",
    status:"Pendente"
  });
  salvarPedidos(pedidos);
  res.redirect("/cliente");
});

// Login admin
app.get("/login-admin",(req,res)=>{ res.render("login_admin"); });
app.post("/login-admin",(req,res)=>{
  const {usuario,senha} = req.body;
  if(usuario===adminUser.usuario && senha===adminUser.senha){
    req.session.admin = true;
    res.redirect("/admin");
  } else { res.send("Usuário ou senha inválidos"); }
});

// Área admin
app.get("/admin",(req,res)=>{
  if(!req.session.admin) return res.redirect("/login-admin");
  res.render("admin",{ pedidos: lerPedidos() });
});

// Aprovar pedido
app.get("/aprovar/:index",(req,res)=>{
  if(!req.session.admin) return res.redirect("/login-admin");
  const pedidos = lerPedidos();
  const i = parseInt(req.params.index);
  if(pedidos[i]){ pedidos[i].status="Aprovado"; salvarPedidos(pedidos); }
  res.redirect("/admin");
});

app.listen(3000,()=>{ console.log("Servidor rodando em http://localhost:3000"); });
