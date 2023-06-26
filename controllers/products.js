import express from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import createError from "http-errors";
import geoip from "geoip-lite";
import Product from "../models/product.js";
import { isEmptyObject } from "../helpers/helpers.js";

const router = express.Router();

export const createProduct = async (req, res) => {
  const product = req.body;

  const newProduct = new Product(product);

  try {
    await newProduct.save();
    const stockItemObject = {
      productId: newProduct._id,
      qty: 0,
      available: 0,
      date,
      warehouse,
      productCode,
      productBrand,
      productCapacity,
    };

    res.header("Access-Control-Allow-Origin", "*");
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

// await Product.updateMany({}, { $set: { stock: 0 } }, function (err, result) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(result);
//   }
// });
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number, defaulting to 1
    const limit = parseInt(req.query.limit) || 10; // Number of products per page, defaulting to 10

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw createError(400, "Invalid page or limit value");
    }

    const skip = (page - 1) * limit; // Number of products to skip

    const totalProducts = await Product.countDocuments(); // Total number of products

    const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages

    if (page > totalPages) {
      throw createError(400, "Invalid page number");
    }

    const products = await Product.find().sort({ _id: -1 }).skip(skip).limit(limit);

    res.json({ data: products, page, totalPages });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      return next(createError(400, "Invalid ID format"));
    }

    next(error);
  }
};

export const getProductsByFilter = async (req, res) => {
  const { categories, countries, companies, brands } = req.query;
  const page = req.query.page;

  const products = await Product.find();
  res.json({ data: products });
};

export const getProductsBySearch = async (req, res) => {
  const filters = req.query.filters;
  const page = req.query.page;
  const { categories, countries, companies, brands, capacities } = req.query;
  //   capacities = JSON.parse(capacities);
  //let capacities2 = JSON.parse(capacities);
  //console.log(capacities2);
  const isCategories = categories.split(",")[0] !== "";
  const isCountries = countries.split(",")[0] !== "";
  const isCompanies = companies.split(",")[0] !== "";
  let isBrands = brands.split(",")[0] !== "";

  if (brands.split(",").includes("undefined")) {
    isBrands = false;
  }
  // const isCapacities = capacities.split(",")[0] !== "";
  try {
    const Q_ALL_CATEGORIES = { category: { $in: categories.split(",") } };
    const Q_ALL_COUNTRIES = { country: { $in: countries.split(",") } };
    const Q_ALL_COMPANIES = { company: { $in: companies.split(",") } };
    const Q_ALL_BRANDS = { brand: { $in: brands.split(",") } };

    // const title = new RegExp(searchQuery, "i");
    let products = [];
    let caps = [];
    /*
    if (isCapacities) {
      const products = await Product.find({ capacity: { $in: capacities.split(",") } });
      res.json({ data: products });
      return;
    }
*/
    if (isBrands && !isCompanies && isCountries && isCategories) {
      const products = await Product.find(Q_ALL_BRANDS).sort({ stock: -1 });
      res.json({ data: products });
      return;
    }
    if (isBrands && isCompanies && isCountries && isCategories) {
      const products1 = await Product.find(Q_ALL_BRANDS).sort({ stock: -1 });
      const products2 = await Product.find(Q_ALL_COMPANIES).sort({ stock: -1 });
      const products = [...products1, ...products2];
      res.json({ data: products });
      return;
    }

    if (isCompanies && isCountries && isCategories) {
      const products = await Product.find(Q_ALL_COMPANIES).sort({ stock: -1 });
      res.json({ data: products });
      return;
    }

    if ((isCategories && !isCountries) || (isCategories && countries.includes("All"))) {
      if (categories.includes("All")) {
        const products = await Product.find().sort({ stock: -1 });
        res.json({ data: [...products, productsForCountries] });
        return;
      }
      products = await Product.find(Q_ALL_CATEGORIES).sort({ stock: -1 });
      res.json({ data: [...products, productsForCountries] });
    } else if (!isCategories && isCountries) {
      if (countries.includes("All")) {
        const products = await Product.find().sort({ stock: -1 });
        res.json({ data: products });
        return;
      }
      const products = await Product.find(Q_ALL_COUNTRIES).sort({ stock: -1 });
      res.json({ data: products });
      return;
    } else if (isCountries && isCategories) {
      /// All Categories & All Countries
      if (categories.split(",").includes("All") && countries.split(",").includes("All")) {
        const products = await Product.find().sort({ stock: -1 });
        res.json({ data: [...products, con] });
        return;
      } else if (categories.split(",").includes("All")) {
        const products = await Product.find(Q_ALL_COUNTRIES).sort({
          stock: -1,
        });
        res.json({ data: [...products, con] });
        return;
      } else if (countries.split(",").includes("All")) {
        const products = await Product.find(Q_ALL_CATEGORIES).sort({
          stock: -1,
        });
        res.json({ data: [...products, con] });
        return;
      }
      const products = await Product.find({
        $and: [Q_ALL_CATEGORIES, Q_ALL_COUNTRIES],
      }).sort({ stock: -1 });
      res.json({
        data: [...products, con],
      });
    } else {
      const products = await Product.find().sort({ stock: -1 });
      res.json({ data: [...products, productsForCountries] });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No product with id: ${id}`);
  }

  try {
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).send(`No product with id: ${id}`);
    }

    const update = {};
    const { category, country, company, brand, code, capacity, image, description, datasheet, netWeight, grossWeight, palatSize } = req.body;

    if (typeof category === "string" && category.length > 0) {
      update.category = category;
    }
    if (typeof country === "string" && country.length > 0) {
      update.country = country;
    }
    if (typeof company === "string" && company.length > 0) {
      update.company = company;
    }
    if (typeof brand === "string" && brand.length > 0) {
      update.brand = brand;
    }
    if (typeof code === "string" && code.length > 0) {
      update.code = code;
    }
    if (typeof capacity === "string" && capacity.length > 0) {
      update.capacity = capacity;
    }
    if (typeof description === "string" && description.length > 0) {
      update.description = description;
    }
    if (typeof netWeight === "number" && netWeight >= 0) {
      update.netWeight = netWeight;
    }
    if (typeof grossWeight === "number" && grossWeight >= 0) {
      update.grossWeight = grossWeight;
    }
    if (typeof palatSize === "number" && palatSize >= 0) {
      update.palatSize = palatSize;
    }

    if (isEmptyObject(update)) {
      return res.status(400).json({ error: "No valid values to update" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProductPrice = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No product with id: ${id}`);
  }
  const { netPrice, retailPrice, wholesalePrice } = req.body;
  const update = {};

  if (typeof netPrice === "number" && netPrice >= 0) {
    update.netPrice = netPrice;
  }
  if (typeof retailPrice === "number" && retailPrice >= 0) {
    update.retailPrice = retailPrice;
  }
  if (typeof wholesalePrice === "number" && wholesalePrice >= 0) {
    update.wholesalePrice = wholesalePrice;
  }

  if (isEmptyObject(update)) {
    return res.status(400).json({ error: "No valid values to update" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({
      message: "Product price updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product price:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;

  try {
    // Check if the provided ID is a valid Object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Check if the product exists
    const product = await Product.findById(id).exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product
    const result = await product.deleteOne();

    const reply = `Product ${product.name} with ID ${result._id} deleted`;

    res.json(reply);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const updateProductStock = async (req, res) => {
  const id = req.params.id;
  const stock = parseInt(req.query.stock);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No product with id: ${id}`);
  }
  const update = {};

  if (typeof stock === "number" && stock >= 0) {
    update.stock = stock;
  }
  if (isEmptyObject(update)) {
    return res.status(400).json({ error: "No valid values to update" });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({
      message: "Product srock updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// export const updateProductWarehouseBlQty = async (req, res) => {
//   const id = req.params.id;
//   const { code, qty, date, warehouse, booked } = req.body;

//   if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No product with id: ${id}`);
//   try {
//     const product = await Product.findOne({ _id: id });
//     if (product) {
//       const item_index = product.bl.findIndex((obj) => obj.warehouse === warehouse && obj.code === code);
//       product.bl[item_index].qty = qty;
//       product.bl[item_index].date = date;
//       product.bl[item_index].booked = booked;
//       try {
//         product.markModified("bl");
//         await product.save();
//         res.header("Access-Control-Allow-Origin", "*");
//         res.status(201).json(product.bl);
//       } catch (err) {
//         res.status(409).json({ message: err });
//       }
//     }
//   } catch (err) {
//     res.status(409).json({ message: err });
//   }
// };

export const bookPiProducts = async (req, res) => {
  const id = req.params.id;
  const booked = [];

  try {
    const proformaInvoice = await ProformaInvoice.findById(id);
    const products = proformaInvoice.products;
    let productsToUpdate = [];
    products.map((product) => {
      productsToUpdate.push({ id: product._id, qty: product.qty });
    });
    productsToUpdate.map(async (product) => {
      const bookedItem = await bookProduct(product.id, product.qty);
      booked.push(bookedItem);
    });
    const proforma = await SignedPiPDF.findOne({ pi_id: id }).exec();
    if (!proforma) {
      console.log("ProformaInvoice not found");
    }
    proforma.status = "BOOKED";
    proforma.pi_done_status.push("BOOKED");
    proforma.booked = booked;
    const updatedProformaInvoice = await proforma.save();

    res.json(productsToUpdate);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const bookProduct = async (id, qty) => {
  let booked = { productId: id, bookedQty: [] };
  try {
    const product = await Product.findOne({ _id: id });
    if (product) {
      const stockBl = product.bl.filter((bl) => bl.warehouse !== "coming" && bl.warehouse !== "production");
      const sortedBl = stockBl.sort((a, b) => new Date(a.date) - new Date(b.date));
      for (let i = 0; i < sortedBl.length; i++) {
        const currentObject = sortedBl[i];

        // Decrease the quantity from the current object
        if (qty >= currentObject.qty - currentObject.booked) {
          qty -= currentObject.qty - currentObject.booked;
          booked.bookedQty.push({
            warehouse: currentObject.warehouse,
            code: currentObject.code,
            qty: currentObject.qty - currentObject.booked,
          });
          currentObject.booked = currentObject.qty;
        } else {
          currentObject.booked += qty;
          booked.bookedQty.push({
            warehouse: currentObject.warehouse,
            code: currentObject.code,
            qty: qty,
          });

          qty = 0;
          break;
          // Exit the loop since the quantity has been fully decreased
        }
      }
      //const item_index = product.bl.findIndex((obj) => obj.warehouse === warehouse && obj.code === code);
      // product.bl[0].booked += qty;
      //  console.log(product.bl);
      try {
        product.markModified("bl");
        await product.save();
      } catch (err) {}
      // product.save();
    }
  } catch (err) {
    console.log(err);
  }

  return booked;
};

export const unbookPiProducts = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  const booked = [];

  try {
    const proforma = await SignedPiPDF.findOne({ pi_id: id }).exec();
    if (!proforma) {
      console.log("ProformaInvoice not found");
    }
    const productsToUnbook = proforma.booked;
    productsToUnbook.map((item) => {
      unBookProduct(item.productId, item.bookedQty);
    });

    proforma.status = "CONFIRMED";
    proforma.pi_done_status = proforma.pi_done_status.filter((status) => status !== "BOOKED");
    proforma.booked = [];
    const updatedProformaInvoice = await proforma.save();

    res.json(updatedProformaInvoice);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const unBookProduct = async (id, qtys) => {
  let booked = { productId: id, bookedQty: [] };
  try {
    const product = await Product.findOne({ _id: id });
    if (product) {
      //    const stockBl = product.bl.filter((bl) => bl.warehouse !== "coming" && bl.warehouse !== "production");

      qtys.map((item) => {
        const blIndex = product.bl.findIndex((obj) => obj.warehouse === item.warehouse && obj.code === item.code);
        product.bl[blIndex].booked -= item.qty;
      });

      //const item_index = product.bl.findIndex((obj) => obj.warehouse === warehouse && obj.code === code);
      // product.bl[0].booked += qty;
      //  console.log(product.bl);
      try {
        product.markModified("bl");
        await product.save();
      } catch (err) {}
      // product.save();
    }
  } catch (err) {
    console.log(err);
  }

  return booked;
};

export default router;
