import mongoose from "mongoose";
import Inc from "mongoose-sequence";

const AutoIncrement = Inc(mongoose);

const truckItemSchema = mongoose.Schema({
  truckNo: { type: String, required: true },
  truckDriverName: { type: String },
  truckDriverTel: { type: String },
  truckNetWeight: { type: Number, required: true },
  truckGrossWeight: { type: Number, required: true },
  truckTotalPackages: { type: Number, required: true },
  truckTotalAmount: { type: Number, required: true },
  truckTotalPallets: { type: Number },
});

const productSchema = mongoose.Schema({
  category: { type: String },
  country: { type: String },
  company: { type: String },
  brand: { type: String },
  code: { type: String, index: true },
  description: { type: String },
  price: { type: Number },
  datasheet: { type: String },
  capacity: { type: String },
  image: [{ type: String }],
  netWeight: { type: Number },
  grossWeight: { type: Number },
  palletSize: { type: Number },
  qty: { type: Number },
  totalNetWeight: { type: Number },
  totalGrossWeight: { type: Number },
  totalAmount: { type: Number },
});

const packingListSchema = mongoose.Schema(
  {
    no: { type: Number, index: true },
    pi: {
      piNo: { type: Number, required: true },
      piId: { type: String },
    },
    invoiceNo: { type: String, required: true },

    date: { type: Date, default: new Date() },
    customer: {
      customerName: { type: String },
      customerId: { type: String },
      customerAddress: { type: String },
      customerPhoneNumber: { type: String },
    },
    status: {
      pklStatus: { type: String, default: "Pending" },
      departed: { type: Boolean, default: false },
    },
    invoiceInfo: {
      additions: { type: Number },
      additionsDescription: { type: String },
      discount: { type: Number },
      discountDescription: { type: String },
    },
    products: [productSchema],

    totalGrossWeight: { type: Number },
    totalNetWeight: { type: Number },
    totalAmount: { type: Number },

    truckItems: [truckItemSchema],
  },
  {
    timestamps: true,
  }
);

packingListSchema.plugin(AutoIncrement, {
  inc_field: "pkl_no",
  id: "pklNums",
  start_seq: 10000,
});

var PackingList = mongoose.model("PackingList", packingListSchema);

export default PackingList;
