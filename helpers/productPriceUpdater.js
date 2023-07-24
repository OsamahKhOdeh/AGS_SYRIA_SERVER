import Product from "../models/product.js";
import Currency from "../models/currency.js"; // Import the Currency model if not already imported

const updateAllPrices = async () => {
  console.log("star");
  let exchange_rate_to_usd_aleppo;
  let exchange_rate_to_usd_manual;
  let addition_on_exchange_rate;
  let exchange_rate_mode;

  try {
    const currencyCode = "SYP";
    const currencyData = await Currency.findOne({ currency_code: currencyCode });
    if (!currencyData) {
      console.log({ error: `Currency data for ${currencyCode} not found` });
    }

    exchange_rate_to_usd_aleppo = currencyData.exchange_rate_to_usd_aleppo;
    exchange_rate_to_usd_manual = currencyData.exchange_rate_to_usd_manual;
    addition_on_exchange_rate = currencyData.addition_on_exchange_rate;
    exchange_rate_mode = currencyData.exchange_rate_mode;
  } catch (error) {
    console.error("Error retrieving exchange rate:", error);
    //return res.status(500).json({ error: "An error occurred while retrieving exchange rate" });
  }
  try {
    const products = await Product.find().select("retailPrice wholesalePrice netPrice retailPriceSYP wholesalePriceSYP netPriceSYP");

    for (const product of products) {
      const { retailPrice, wholesalePrice, netPrice } = product;
      let retailPriceSYP = retailPrice;
      let wholesalePriceSYP = wholesalePrice;
      let netPriceSYP = netPrice;
      if (exchange_rate_mode === "auto") {
        retailPriceSYP = retailPrice * (exchange_rate_to_usd_aleppo + addition_on_exchange_rate);
        wholesalePriceSYP = wholesalePrice * (exchange_rate_to_usd_aleppo + addition_on_exchange_rate);
        netPriceSYP = netPrice * (exchange_rate_to_usd_aleppo + addition_on_exchange_rate);
      } else if ("manual") {
        retailPriceSYP = retailPrice * exchange_rate_to_usd_manual;
        wholesalePriceSYP = wholesalePrice * exchange_rate_to_usd_manual;
        netPriceSYP = netPrice * exchange_rate_to_usd_manual;
      }
      if (product.retailPriceSYP !== retailPriceSYP || product.wholesalePriceSYP !== wholesalePriceSYP || product.netPriceSYP !== netPriceSYP) {
        product.retailPriceSYP = retailPriceSYP;
        product.wholesalePriceSYP = wholesalePriceSYP;
        product.netPriceSYP = netPriceSYP;

        await product.save();
        console.log(product);
      }
    }

    console.log({ message: "Prices updated for all products" });
  } catch (error) {
    console.log({ message: "Error updating prices for all products", error });
  }
};

export { updateAllPrices };
