import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.pre(["find", "findOne"], function () {
  this.populate("products.product");
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
