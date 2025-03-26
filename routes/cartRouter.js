import { Router } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

const cartRouter = Router();

cartRouter.get("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
        }

        const cart = await Cart.findById(cid).populate("products.product").select("-__v");
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        res.json({ status: "success", cart });
    } catch (error) {
        console.error("Error obteniendo el carrito:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
});

cartRouter.post("/", async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        res.json({ status: "success", message: "Carrito creado", cartId: newCart._id });
    } catch (error) {
        console.error("Error creando el carrito:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
});

cartRouter.post("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        let { quantity } = req.body;

        console.log("CID recibido en el backend:", cid);
        console.log("PID recibido en el backend:", pid);

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ status: "error", message: "ID de carrito o producto inválido" });
        }

        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ status: "error", message: "La cantidad debe ser un número mayor a 0" });
        }

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        // Buscar si el producto ya está en el carrito y actualizar cantidad
        const updatedCart = await Cart.findOneAndUpdate(
            { _id: cid, "products.product": pid },
            { $inc: { "products.$.quantity": quantity } },
            { new: true }
        ).populate("products.product");

        if (!updatedCart) {
            // Si no existe, agregarlo
            await Cart.findByIdAndUpdate(
                cid,
                { $push: { products: { product: pid, quantity } } },
                { new: true }
            );
        }

        res.json({ status: "success", message: "Producto agregado al carrito", cart: updatedCart });
    } catch (error) {
        console.error("Error agregando producto al carrito:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
});

cartRouter.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ status: "error", message: "ID de carrito o producto inválido" });
        }

        const cart = await Cart.findByIdAndUpdate(
            cid,
            { $pull: { products: { product: pid } } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        res.json({ status: "success", message: "Producto eliminado del carrito", cart });
    } catch (error) {
        console.error("Error eliminando producto del carrito:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
});

cartRouter.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ status: "error", message: "ID de carrito inválido" });
        }

        const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });

        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        res.json({ status: "success", message: "Carrito vaciado correctamente", cart });
    } catch (error) {
        console.error("Error vaciando el carrito:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
});

export default cartRouter;
