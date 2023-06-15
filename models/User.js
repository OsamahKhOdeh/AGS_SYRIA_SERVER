import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: { type: String },
    roles: [
      {
        type: String,
        default: "Employee",
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
  },
  {
    timestamps: true,
  }
);
var Product = mongoose.model("User", userSchema);

export default Product;
