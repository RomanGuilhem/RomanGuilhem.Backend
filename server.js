import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { config } from "./config/config.js";
import viewsRouter from "./routes/viewsRouter.js";
import productRouter from "./routes/product.router.js";
import cartRouter from "./routes/cartRouter.js";
import Product from "./models/Product.js";
import { handlebarsHelpers } from "./utils/handlebarsHelpers.js";

if (!config.URL_MONGODB) {
  console.error("ERROR: No se ha definido la URL de MongoDB en la configuración.");
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

mongoose
  .connect(config.URL_MONGODB)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => {
    console.error("Error conectando a MongoDB:", err.stack);
  });

app.engine(
  "handlebars",
  engine({
    helpers: handlebarsHelpers,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.resolve("views"));

app.use(cors());
app.use(express.static(path.resolve("public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", viewsRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

mongoose.connection.once("open", () => {
  console.log("Base de datos conectada, habilitando WebSockets");

  io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    const enviarProductosActualizados = async () => {
      try {
        const productos = await Product.find().lean();
        io.emit("productosActualizados", productos);
      } catch (error) {
        console.error("Error al obtener productos:", error.stack);
      }
    };

    enviarProductosActualizados();

    socket.on("nuevoProducto", async (producto) => {
      try {
        if (!producto.nombre || !producto.precio || !producto.categoria || typeof producto.stock !== "number") {
          console.error("Producto inválido recibido:", producto);
          return;
        }

        const nuevoProducto = new Product(producto);
        await nuevoProducto.save();

        io.emit("productoAgregado", nuevoProducto);
      } catch (error) {
        console.error("Error al agregar producto:", error.stack);
      }
    });

    socket.on("eliminarProducto", async (id) => {
      try {
        if (!id) {
          console.error("ID inválido para eliminar producto:", id);
          return;
        }

        const productoEliminado = await Product.findByIdAndDelete(id);
        if (productoEliminado) {
          io.emit("productoEliminado", id);
        }
      } catch (error) {
        console.error("Error eliminando producto:", error.stack);
      }
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
});


const PORT = config.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
