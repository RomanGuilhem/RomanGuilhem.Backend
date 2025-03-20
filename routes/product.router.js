import { Router } from "express";
import Product from "../models/Product.js";

const productRouter = Router();

productRouter.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query, categoria, disponible } = req.query;

        let filter = {};
        if (query) filter.nombre = { $regex: query, $options: "i" };
        if (categoria && categoria !== "todas") filter.categoria = categoria;

        if (disponible !== undefined && disponible !== "todas") {
            const disponibleBool = disponible === "true"; 
            filter.stock = disponibleBool ? { $gt: 0 } : { $lte: 0 }; 
        }

        console.log("Filtros aplicados:", filter);

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sort && sort !== "none" ? { precio: sort === "asc" ? 1 : -1 } : {},
            lean: true, 
        };

        const result = await Product.paginate(filter, options);

        const productosConDisponibilidad = result.docs.map(producto => ({
            ...producto,
            disponible: producto.stock > 0 
        }));

        console.log("Productos encontrados:", productosConDisponibilidad.length);

        const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
        const buildLink = (p) => {
            const params = new URLSearchParams({
                limit,
                page: p,
                sort: sort || "",
                query: query || "",
                categoria: categoria || "",
                disponible: disponible || "",
            });
            return `${baseUrl}/?${params.toString()}`;
        };

        res.json({
            status: "success",
            payload: productosConDisponibilidad, 
            totalPages: result.totalPages,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.hasPrevPage ? result.prevPage : null,
            nextPage: result.hasNextPage ? result.nextPage : null,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
        });

    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ status: "error", error: "Error al obtener productos" });
    }
});

export default productRouter;
