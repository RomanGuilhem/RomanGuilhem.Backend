const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

let productos = [
  { id: 1, nombre: "Laptop", precio: 1200 },
  { id: 2, nombre: "Mouse", precio: 25 },
  { id: 3, nombre: "Monitor", precio: 200 },
  { id: 4, nombre: "Mesaza de Mirtha Legrand", precio: 10000000 },
];

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.redirect("/realtimeproducts");
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { productos });
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.emit("productosActualizados", productos);

  socket.on("nuevoProducto", (producto) => {
    producto.id = productos.length + 1; 
    productos.push(producto);
    io.emit("productosActualizados", productos);
  });

  socket.on("eliminarProducto", (id) => {
    productos = productos.filter((producto) => producto.id !== id);
    io.emit("productosActualizados", productos); 
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
