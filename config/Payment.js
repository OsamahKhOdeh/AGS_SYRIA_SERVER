import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    piId: { type: String },
    piNo: { type: String },
    employee: { type: String },
    customer: { type: String },
    amount: { type: String },
    invoiceNo: { type: String },
    paymentFileName: { type: String },
    data: { type: Buffer },
    contentType: { type: String },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);
