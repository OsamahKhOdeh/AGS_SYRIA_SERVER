import { updateCurrency } from "../../helpers/currencyUpdater.js";
import { updateAllPrices } from "../../helpers/productPriceUpdater.js";
import Currency from "../../models/currency.js";

const getExchangeRate = async (req, res) => {
  try {
    // const currencyCode = req.params.currencyCode;

    const currencyCode = "SYP";
    if (!currencyCode) {
      return res.status(400).json({ error: "Currency code not provided" });
    }

    const currencyData = await Currency.findOne({ currency_code: currencyCode });
    if (!currencyData) {
      return res.status(404).json({ error: `Currency data for ${currencyCode} not found` });
    }

    // Send the exchange_rate_to_usd value as a response to the client
    return res.status(200).json({
      exchange_rate_to_usd_aleppo: currencyData.exchange_rate_to_usd_aleppo,
      last_updated: currencyData.last_updated,
      exchange_rate_to_usd_manual: currencyData.exchange_rate_to_usd_manual,
      addition_on_exchange_rate: currencyData.addition_on_exchange_rate,
      exchange_rate_mode: currencyData.exchange_rate_mode,
    });
  } catch (error) {
    console.error("Error retrieving exchange rate:", error);
    return res.status(500).json({ error: "An error occurred while retrieving exchange rate" });
  }
};

const setExchangeRateManual = async (req, res) => {
  try {
    const currency_code = "SYP";
    const { exchange_rate_to_usd_manual } = req.body;
    if (!currency_code || !exchange_rate_to_usd_manual) {
      return res.status(400).json({ error: "Currency code and exchange rate are required" });
    }

    const currencyData = await Currency.findOne({ currency_code });
    if (!currencyData) {
      return res.status(404).json({ error: `Currency data for ${currency_code} not found` });
    }

    currencyData.exchange_rate_to_usd_manual = exchange_rate_to_usd_manual;
    currencyData.last_updated = new Date();

    await currencyData.save();

    return res.status(200).json({ message: `Exchange rate updated for ${currency_code}`, currency: currencyData });
  } catch (error) {
    console.error("Error setting exchange rate:", error);
    return res.status(500).json({ error: "An error occurred while setting the exchange rate" });
  }
};

// Controller to set the addition_on_exchange_rate for a specific currency
const setAdditionOnExchangeRate = async (req, res) => {
  try {
    const currency_code = "SYP";
    const { addition_on_exchange_rate } = req.body;
    if (!currency_code || !addition_on_exchange_rate) {
      return res.status(400).json({ error: "Currency code and addition_on_exchange_rate are required" });
    }
    const currencyData = await Currency.findOne({ currency_code });
    if (!currencyData) {
      return res.status(404).json({ error: `Currency data for ${currency_code} not found` });
    }
    currencyData.addition_on_exchange_rate = addition_on_exchange_rate;
    currencyData.last_updated = new Date();
    await currencyData.save();
    return res.status(200).json({ message: `addition_on_exchange_rate updated for ${currency_code}`, currency: currencyData });
  } catch (error) {
    console.error("Error setting addition_on_exchange_rate:", error);
    return res.status(500).json({ error: "An error occurred while setting the addition_on_exchange_rate" });
  }
};

const setExchangeRateModeController = async (req, res) => {
  try {
    const currency_code = "SYP";
    const { exchange_rate_mode } = req.body;
    if (!currency_code || !exchange_rate_mode) {
      return res.status(400).json({ error: "Currency code and exchange_rate_mode are required" });
    }
    const currencyData = await Currency.findOne({ currency_code });
    if (!currencyData) {
      return res.status(404).json({ error: `Currency data for ${currency_code} not found` });
    }
    currencyData.exchange_rate_mode = exchange_rate_mode;
    currencyData.last_updated = new Date();
    await currencyData.save();

    return res.status(200).json({ message: `Exchange rate mode updated for ${currency_code}`, currency: currencyData });
  } catch (error) {
    console.error("Error setting exchange rate mode:", error);
    return res.status(500).json({ error: "An error occurred while setting the exchange rate mode" });
  }
};

const updateCurrencyController = async (req, res) => {
  try {
    const currency_code = "SYP";
    const { exchange_rate_mode, addition_on_exchange_rate, exchange_rate_to_usd_manual } = req.body;

    if (!currency_code) {
      return res.status(400).json({ error: "Currency code is required" });
    }

    const currencyData = await Currency.findOne({ currency_code });
    if (!currencyData) {
      return res.status(404).json({ error: `Currency data for ${currency_code} not found` });
    }
    if (exchange_rate_mode !== undefined) {
      if (typeof exchange_rate_mode !== "string") {
        return res.status(400).json({ error: "exchange_rate_mode must be a string" });
      }
      currencyData.exchange_rate_mode = exchange_rate_mode;
    }

    if (addition_on_exchange_rate !== undefined) {
      if (typeof addition_on_exchange_rate !== "number") {
        return res.status(400).json({ error: "addition_on_exchange_rate must be a number" });
      }
      currencyData.addition_on_exchange_rate = addition_on_exchange_rate;
    }

    if (exchange_rate_to_usd_manual !== undefined) {
      if (typeof exchange_rate_to_usd_manual !== "number") {
        return res.status(400).json({ error: "exchange_rate_to_usd_manual must be a number" });
      }
      currencyData.exchange_rate_to_usd_manual = exchange_rate_to_usd_manual;
    }

    currencyData.last_updated = new Date();

    await currencyData.save();
    await updateCurrency("SYP", "aleppo");
    await updateAllPrices();

    return res.status(200).json({ message: `Currency data updated for ${currency_code}`, currency: currencyData });
  } catch (error) {
    console.error("Error updating currency data:", error);
    return res.status(500).json({ error: "An error occurred while updating the currency data" });
  }
};

export { getExchangeRate, setExchangeRateManual, setAdditionOnExchangeRate, setExchangeRateModeController, updateCurrencyController };
