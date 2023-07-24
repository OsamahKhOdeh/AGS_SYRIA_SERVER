import cron from "node-cron";
import axios from "axios";
import mongoose from "mongoose";
import Currency from "../models/currency.js";

export const updateCurrency = async (currencyCode, city) => {
  try {
    let query = "";
    const damasQuery = "https://sp-today.com/app_api/cur_damascus.json";
    const aleppoQuery = "https://sp-today.com/app_api/cur_aleppo.json";
    switch (city) {
      case "aleppo":
        query = aleppoQuery;
        break;
      case "damascus":
        query = damasQuery;
        break;
      default:
        query = aleppoQuery;

        break;
    }
    const response = await axios.get(query);
    const currencyData = response.data;
    const usdCurrency = currencyData.filter((currency) => currency.name === "USD");

    // console.log("Exchange rate updated successfully " + usdCurrency[0]?.bid);
    const updateObj = {};
    switch (city) {
      case "aleppo":
        updateObj.exchange_rate_to_usd_aleppo = usdCurrency[0]?.bid;
        break;
      case "damascus":
        updateObj.exchange_rate_to_usd_damas = usdCurrency[0]?.bid;
        break;
      default:
        updateObj.exchange_rate_to_usd_aleppo = usdCurrency[0]?.bid;

        break;
    }
    const now = new Date();
    updateObj.last_updated = new Date(now.getTime());
    await Currency.updateOne(
      { currency_code: currencyCode },
      {
        $set: updateObj,
      },
      { upsert: true }
    );

    console.log("Currency data updated successfully OKAY.");
  } catch (error) {
    console.error("Error updating currency data:", error);
  }
};

// const newCurrency = new Currency({
//   currency_code: "SYP",
//   name: "Syrian Pound",
//   symbol: "ل س",
//   decimal_places: 2,
//   exchange_rate_to_usd: 1.0,
//   value_to_usd: 1.0,
//   last_updated: "2023-07-22T12:00:00.000Z",
// });
// newCurrency
//   .save()
//   .then((result) => {
//     console.log("New currency added successfully:", result);
//   })
//   .catch((error) => {
//     console.error("Error adding new currency:", error);
//   });
