import mongoose from "mongoose";
const productSchema = mongoose.Schema(
  {
    category: { type: String, required: true },
    country: { type: String, required: true },
    company: { type: String, required: true },
    brand: { type: String, required: true },
    code: { type: String, required: true, index: true },
    capacity: { type: String, required: true },
    image: [{ type: String }],
    description: { type: String },
    price: { type: Number, required: true },
    netPrice: { type: Number, required: true },

    retailPrice: { type: Number },
    wholesalePrice: { type: Number },
    stock: { type: Number, required: true },
    booked: { type: Number },
    coming: { type: Number },
    datasheet: { type: String },
    netWeight: { type: Number },
    grossWeight: { type: Number },

    palatSize: { type: Number },
  },
  {
    timestamps: true,
  }
);

var Product = mongoose.model("Product", productSchema);

export default Product;
