import { Router } from "express";
import Product from "../models/Product.js";

const viewsRouter = Router();

viewsRouter.get("/", async (req, res) => {
  try {
    let { limit = 10, page = 1, sort, query, categoria, disponible } = req.query;

    const limitNum = parseInt(limit) || 10;
    const pageNum = parseInt(page) || 1;

    const filter = {};
    if (query) filter.nombre = { $regex: query, $options: "i" };
    if (categoria && categoria !== "todas") filter.categoria = categoria;

    // 🔥 Arreglo del filtro de disponibilidad
    if (disponible === "true") {
      filter.stock = { $gt: 0 }; // Productos con stock
    } else if (disponible === "false") {
      filter.stock = 0; // Productos sin stock
    }

    console.log("Filtro aplicado:", filter);

    const sortOption = sort === "asc" ? { precio: 1 } : sort === "desc" ? { precio: -1 } : {};

    const totalDocs = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limitNum);
    const productos = await Product.find(filter)
      .sort(sortOption)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();
    const categorias = await Product.distinct("categoria");

    const hasPrevPage = pageNum > 1;
    const hasNextPage = pageNum < totalPages;
    const prevPage = hasPrevPage ? pageNum - 1 : null;
    const nextPage = hasNextPage ? pageNum + 1 : null;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const buildLink = (p) =>
      `${baseUrl}/?limit=${limitNum}&page=${p}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}${categoria ? `&categoria=${categoria}` : ""}${disponible !== undefined ? `&disponible=${disponible}` : ""}`;

    const prevLink = hasPrevPage ? buildLink(prevPage) : null;
    const nextLink = hasNextPage ? buildLink(nextPage) : null;

    res.render("home", {
      status: "success",
      productos,
      categorias,
      categoriaActual: categoria || "todas",
      disponibilidad: disponible !== undefined ? disponible : "todas",
      sort: sort || "none",
      totalPages,
      prevPage,
      nextPage,
      page: pageNum,
      hasPrevPage,
      hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

viewsRouter.get("/realTimeProducts", async (req, res) => {
  try {
    const productos = await Product.find().lean();
    res.render("realTimeProducts", {
      title: "Productos en Tiempo Real",
      productos,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default viewsRouter;
