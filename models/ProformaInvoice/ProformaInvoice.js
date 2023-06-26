import mongoose from "mongoose";
import Inc from "mongoose-sequence";

import autoIncrement from "mongoose-auto-increment";
autoIncrement.initialize(mongoose.connection);

const AutoIncrement = Inc(mongoose);
const productSchema = mongoose.Schema({
  category: { type: String, required: true },
  country: { type: String, required: true },
  company: { type: String, required: true },
  brand: { type: String, required: true },
  code: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number },
  stock: { type: Number },
  datasheet: { type: String },
  capacity: { type: String, required: true },
  image: [{ type: String }],
  netWeight: { type: Number },
  grossWeight: { type: Number },
  palletSize: { type: Number },
});

const proformaInvoiceSchema = mongoose.Schema(
  {
    date: { type: Date, default: new Date() },
    customer: {
      customerName: { type: String },
      customerId: { type: String },
      customerAddress: { type: String },
      customerPhoneNumber: { type: String },
    },
    finance: {
      financialApproval: { type: Boolean, default: false },
      financialMessage: { type: String },
      finaceEmployeeName: { type: String },
      finaceEmployeeId: { type: String },
    },
    salesManger: {
      salesManagerApproval: { type: Boolean, default: false },
      salesMangerMessage: { type: String },
      salesMangerEmployeeName: { type: String },
      salesMangerEmployeeId: { type: String },
    },
    status: {
      piStatus: { type: String, default: "Pending" },
      departed: { type: Boolean, default: false },
    },
    invoiceInfo: {
      additions: { type: Number },
      additionsDescription: { type: String },
      discount: { type: Number },
      discountDescription: { type: String },
    },
    sales: {
      salesEmployeeName: { type: String },
      salesEmployeeId: { type: String },
      salesMessage: { type: String },
    },
    cart: [
      {
        product: {},
        qty: { type: Number },
        price: { type: Number },
        totalGrossWeight: { type: Number },
        totalNetWeight: { type: Number },
        totalAmount: { type: Number },
      },
    ],
    // products: [productSchema],

    totalGrossWeight: { type: Number },
    totalNetWeight: { type: Number },
    totalAmount: { type: Number },

    note: { type: String, default: "No note" },
    paymentPercentage: { type: String, default: "30" },
    deliveryDate: { type: String, default: "7" },
    processStatus: [
      {
        status: { type: String, default: "STARTED" },
        statusIndex: { type: Number, default: 0 },
        startTime: { type: Date, default: new Date() },
        endTime: { type: Date, default: new Date() },
        duration: { type: Number, default: 0 },
        notes: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

proformaInvoiceSchema.plugin(AutoIncrement, {
  inc_field: "pi_no",
  id: "piNum",
  start_seq: 10000,
});
// proformaInvoiceSchema.plugin(autoIncrement.plugin, {
//   model: "ProformaInvoice",
//   field: "pi_no",
//   startAt: 10000,
// });
var ProformaInvoice = mongoose.model("ProformaInvoice", proformaInvoiceSchema);

export default ProformaInvoice;
