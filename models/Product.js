import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    descripcion: { type: String, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    categoria: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("Product", productSchema);

export default Product;
