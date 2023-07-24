import express from "express";
import { getExchangeRate, setAdditionOnExchangeRate, setExchangeRateManual, updateCurrencyController } from "../../controllers/Currency/currencyControllers.js";

const router = express.Router();

router.get("/", getExchangeRate);
router.patch("/manual", setExchangeRateManual);
router.patch("/addition", setAdditionOnExchangeRate);
router.patch("/update", updateCurrencyController);

// router.patch("/" , )

export default router;
