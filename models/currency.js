import mongoose from "mongoose";
// Define the currency schema
const currencySchema = new mongoose.Schema({
  currency_code: String,
  name: String,
  symbol: String,
  decimal_places: Number,
  exchange_rate_to_usd_damas: Number,
  exchange_rate_to_usd_aleppo: Number,
  exchange_rate_to_usd_manual: Number,

  value_to_usd: Number,
  last_updated: Date,
  addition_on_exchange_rate: Number,
  exchange_rate_mode: { type: String, default: "auto" },
});

// Create the Currency model
const Currency = mongoose.model("Currency", currencySchema);

// Export the model to be used in other parts of your application
export default Currency;
