import express from "express";

import {
  createProduct,
  getProducts,
  getProductsBySearch,
  getProductsByFilter,
  updateProduct,
  deleteProduct,
  updateProductStock,
  bookPiProducts,
  unbookPiProducts,
  updateProductPrice,
} from "../controllers/products.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();
//import auth from "../middleware/auth.js";

router.get("/search", getProductsBySearch);
//router.get("/search", getProductsByFilter);

router.get("/", getProducts);
//0router.get("/:id", getPost);

router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.patch("/price/:id", updateProductPrice);
router.patch("/stock/:id", updateProductStock);
router.patch("/bookpiproducts/:id", verifyJWT, bookPiProducts);
router.patch("/unbookpiproducts/:id", verifyJWT, unbookPiProducts);

router.delete("/:id", deleteProduct);

export default router;
