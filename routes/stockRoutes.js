import express from "express";
import {
  addStockItem,
  bookPiProducts,
  departPiProducts,
  getStock,
  unbookPiProducts,
  updateProductStock,
  updateProductWarehouseBlQty,
  updateStock,
} from "../controllers/stockControllers/stockControllers.js";
import verifyJWT from "../middleware/verifyJWT.js";
const router = express.Router();

//router.use(verifyJWT)

router.post("/:id", addStockItem);
router.patch("/book/:id", bookPiProducts);
router.patch("/unbook/:id", unbookPiProducts);
router.patch("/depart/:id", departPiProducts);
router.patch("/productqty/:id", updateProductWarehouseBlQty);
router.patch("/update/:id", updateProductStock);

router.get("/", getStock);
router.patch("re/:id", bookPiProducts);

//localhost:5000/stock/book/6461ea04a63e014a3850fbd7
/*
router.post("/stock/:id", updateProductStock);
router.patch("/stockall/:id", updateStock);
router.patch("/productqty/:id", updateProductWarehouseBlQty);
router.patch("/productbookedqty/:id", updateProductWarehouseBlBookedQty);
router.patch("/productmoveavailable/:id", updateProductMoveToAvailable);
router.patch("/productmovecoming/:id", updateProductMoveToComing);
router.patch("/bookpiproducts/:id", bookPiProducts);
router.patch("/unbookpiproducts/:id", unbookPiProducts);
*/
export default router;
