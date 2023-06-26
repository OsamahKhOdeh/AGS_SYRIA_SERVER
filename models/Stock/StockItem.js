import mongoose from "mongoose";
const stockItemSchema = mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    productCode: { type: String, default: "" },
    productBrand: { type: String, default: "" },
    productCapacity: { type: String, default: "" },
    bl: { type: String, required: true },
    date: { type: Date, default: Date.now },
    ci: { type: String, default: "" },
    warehouse: { type: String, required: true },
    containers: { type: Array, default: [] },
    qty: { type: Number, required: true, default: 0 },
    booked: { type: Number, default: 0 },
    available: { type: Number, default: 0 },
    status: { type: String, default: "" },
    serialNumbers: { type: Array, default: [] },
    pusrchaseInvoice: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

var Project = mongoose.model("StockItem", stockItemSchema);

export default Project;
