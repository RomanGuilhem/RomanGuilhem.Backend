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

        const cart = await Cart.findById(cid).populate("products.product");

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
        const newCart = new Cart({ products: [] });
        await newCart.save();

        res.json({ status: "success", message: "Carrito creado", cartId: newCart._id });
    } catch (error) {
        console.error("Error creando el carrito:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
});

cartRouter.post("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ status: "error", message: "ID de carrito o producto inválido" });
        }

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        }

        const existingProduct = cart.products.find(p => p.product.toString() === pid);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }

        await cart.save();
        res.json({ status: "success", message: "Producto agregado al carrito", cart });
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

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid);

        await cart.save();
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

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
        }

        cart.products = [];
        await cart.save();

        res.json({ status: "success", message: "Carrito vaciado correctamente", cart });
    } catch (error) {
        console.error("Error vaciando el carrito:", error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }
});

export default cartRouter;
