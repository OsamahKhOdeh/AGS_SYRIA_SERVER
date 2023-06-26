import express from "express";

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

import StockItem from "../../models/Stock/StockItem.js";

import Product from "../../models/product.js";
import PackingList from "../../models/PackingList/PackingList.js";
import { pklStatus, stockStatus } from "../../config/piStatus.js";
import { isEmptyObject } from "../../helpers/helpers.js";

const router = express.Router();
/* -------------------------------------------------------------------------- */
/*                                add to stock                                */
/* -------------------------------------------------------------------------- */
export const addStockItem = async (req, res) => {
  const productId = req.params.id;
  const { code, qty, date, warehouse, productBrand, productCode, productCapacity } = req.body;
  // Confirm data
  if (!code || !qty || !date || !warehouse || !productCode) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const stockItemObject = {
    productId,
    bl: code,
    qty,
    available: qty,
    date,
    warehouse,
    productCode,
    productBrand,
    productCapacity,
  };

  // Create and store new stockItem

  const stockItem = await StockItem.create(stockItemObject);

  if (stockItem) {
    //created
    res.status(201).json(stockItem);
  } else {
    res.status(400).json({ message: "something went wrong" });
  }
};

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                   book pi                                  */
/* -------------------------------------------------------------------------- */

export const bookPiProducts = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const proformaInvoice = await ProformaInvoice.findById(id);
  // const proforma = await SignedPiPDF.findOne({ pi_id: id }).exec();
  if (!proformaInvoice) {
    return res.status(400).json({ message: "Wrong pi id" });
  }
  console.log("pi and signed found");
  const products = proformaInvoice.products;
  let productsToUpdate = [];
  let booked = [];
  products.map((product) => {
    let prod = product.country + " " + product.category + " " + product.brand + " " + product.code + " " + product.capacity;

    /* --------------------------------For Solar QTY------------------------------------------ */
    if (product.category === "Solar") {
      console.log({ qty: product.qty / parseInt(product.capacity) });
      productsToUpdate.push({
        id: product._id,
        qty: product.qty / parseInt(product.capacity),
        prod: prod,
      });
    } else productsToUpdate.push({ id: product._id, qty: product.qty, prod: prod });
    /* -------------------------------------------------------------------------- */
  });
  console.log(productsToUpdate);
  await Promise.all(
    productsToUpdate.map(async (product) => {
      const bookedItem = await bookProduct(product.id, product.qty, product.prod);
      console.log("...........");
      console.log(bookedItem);
      console.log("...........");
      proformaInvoice.booked.push(bookedItem);
      //proforma.booked.push(bookedItem);
    })
  );
  // console.log(booked);

  // proforma.status = "BOOKED";
  //proforma.pi_done_status.push("BOOKED");
  //  proforma.booked = booked;
  console.log(booked);
  // const updatedProformaInvoice = await proforma.save();
  proformaInvoice.stockStatus = stockStatus.BOOKED;
  const updatedProformaInvoice2 = await proformaInvoice.save();
  res.json({
    result: "BOOKED Sucessfully",
    updatedProformaInvoice: updatedProformaInvoice2,
  });
};

const bookProduct = async (id, qty, prod) => {
  let booked = { productId: id, bookedQty: [], product: prod };
  try {
    let stockItems = await StockItem.find({ productId: id });

    //Remove items with warehouse equal to coming or production
    stockItems = stockItems.filter((item) => item.warehouse !== "coming" && item.warehouse !== "production");
    // Sort items by bl date ascending from the oldest to the latest
    stockItems = stockItems.sort((a, b) => new Date(a.date) - new Date(b.date));
    //loop through stock items
    console.log(stockItems.length);

    for (let i = 0; i < stockItems.length; i++) {
      const currentObject = stockItems[i];

      // Decrease the quantity from the current object
      if (qty >= currentObject.available) {
        let bookedFromItem = currentObject.available;
        qty -= currentObject.available;
        currentObject.booked += currentObject.available;
        currentObject.available = 0;
        await currentObject.save();
        booked.bookedQty.push({
          warehouse: currentObject.warehouse,
          code: currentObject.bl,
          qty: bookedFromItem,
        });
      } else {
        let bookedFromItem = qty;

        currentObject.booked += qty;
        currentObject.available = currentObject.available - qty;
        qty = 0;
        await currentObject.save();
        booked.bookedQty.push({
          warehouse: currentObject.warehouse,
          code: currentObject.bl,
          qty: bookedFromItem,
        });
        break;
        // Exit the loop since the quantity has been fully decrease
      }
    }
    //const item_index = product.bl.findIndex((obj) => obj.warehouse === warehouse && obj.code === code);
    // product.bl[0].booked += qty;
    //  console.log(product.bl);
    try {
      // product.markModified("bl");
      //  await product.save();
    } catch (err) {}
    // product.save();
  } catch (err) {
    console.log(err);
  }
  return booked;
};

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                   unbook pi                                  */
/* -------------------------------------------------------------------------- */

export const unbookPiProducts = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const proformaInvoice = await ProformaInvoice.findById(id);
  if (!proformaInvoice) {
    return res.status(400).json({ message: "Wrong pi id" });
  }
  console.log("pi and signed found");
  const booked = proformaInvoice.booked;
  console.log(booked);
  if (booked.length > 0) {
    booked.map(async (product) => {
      let productStockItems = await StockItem.find({
        productId: product.productId,
      });
      product.bookedQty.map(async (item) => {
        const filteredStockItem = productStockItems.find((stockItem) => stockItem.warehouse === item.warehouse && stockItem.bl === item.code);

        filteredStockItem.available += item.qty;
        filteredStockItem.booked -= item.qty;
        await filteredStockItem.save(); // Update and save the StockItem object
      });
    });
  } else {
    res.json("No booked products to unbook");
    return;
  }
  proformaInvoice.booked = [];
  proformaInvoice.stockStatus = stockStatus.NOT_BOOKED;
  console.log(booked);

  const updatedProformaInvoice2 = await proformaInvoice.save();
  res.json({
    result: "unBooked Sucessfully",
    updatedProformaInvoice: updatedProformaInvoice2,
  });
};

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                                   Depart pi(pkl)                                  */
/* -------------------------------------------------------------------------- */

export const departPiProducts = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const proformaInvoice = await ProformaInvoice.findById(id);
  const pkl = await PackingList.findOne({ piId: id });

  if (!proformaInvoice || !pkl) {
    return res.status(400).json({ message: "Wrong pi id || Wrong pkl" });
  }
  console.log("pi and signed found");
  const booked = proformaInvoice.booked;
  if (pkl.pklStatus === pklStatus.DEPARTED) {
    res.json({
      msg: `pkl with number ${pkl.pklNo} for pi number ${pkl.piNo} already departed`,
    });
    return;
  }
  // if (booked.length > 0) {
  //   booked.map(async (product) => {
  //     let productStockItems = await StockItem.find({ productId: product.productId });
  //     product.bookedQty.map(async (item) => {
  //       const filteredStockItem = productStockItems.find(
  //         (stockItem) => stockItem.warehouse === item.warehouse && stockItem.bl === item.code
  //       );
  //       filteredStockItem.qty -= item.qty;
  //       // filteredStockItem.available -= item.qty;
  //       filteredStockItem.booked -= item.qty;
  //       await filteredStockItem.save(); // Update and save the StockItem object
  //     });
  //   });
  // } else {
  //   res.json({ message: "No Products booked to depart" });
  //   return;
  // }
  // proformaInvoice.booked = [];
  pkl.pklStatus = pklStatus.DEPARTED;
  proformaInvoice.stockStatus = stockStatus.DEPARTED;
  await pkl.save();

  const updatedProformaInvoice2 = await proformaInvoice.save();
  res.json({ message: "Departed Succesfully" });
};

/* -------------------------------------------------------------------------- */
export const getStock = async (req, res) => {
  const products = await Product.find().sort({ stock: -1 });
  const stockItems = await StockItem.find();

  // await StockItem.updateMany({}, { $set: { stock: 0 } }, function (err, result) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(result);
  //   }
  // });

  // products.map(async (product) => {
  //   const stockItemObject = {
  //     productId: product._id,
  //     productCode: product.code,
  //     productBrand: product.brand,
  //     productCapacity: product.capacity,
  //     date: new Date(2023, 0, 1),
  //     ci: "",
  //     warehouse: "all warhouses",
  //     containers: [],
  //     qty: 0,
  //     booked: 0,
  //     available: 0,
  //     status: "",
  //     serialNumbers: [],
  //     pusrchaseInvoice: "",
  //     bl: "all bls",
  //   };
  //   const stockItem = await StockItem.create(stockItemObject);
  // });

  //   // Create and store new stockItem

  //   const stockItem = await StockItem.create(stockItemObject);

  //   if (stockItem) {
  //     //created
  //     res.status(201).json(stockItem);
  //   } else {
  //     res.status(400).json({ message: "something went wrong" });
  //   }
  // });

  let stock = [];
  products.map((product) => {
    let productQty = 0;
    let productBookedQty = 0;
    let productAvailableQty = 0;
    let productComingQty = 0;
    let productComingBookedQty = 0;
    let productUnderProductionQty = 0;

    const productStockItems = stockItems.filter((stockItem) => stockItem.productId.includes(product._id));
    const productWarehouseQuantities = productStockItems.reduce((accumulator, stockItem) => {
      if (stockItem.warehouse !== "coming" && stockItem.warehouse !== "production") {
        productQty += stockItem.qty;
        productAvailableQty += stockItem.available;
        productBookedQty += stockItem.booked;
      }
      const warehouseIndex = accumulator.findIndex((item) => item.warehouse === stockItem.warehouse);

      if (warehouseIndex !== -1) {
        accumulator[warehouseIndex].warehouseQty += stockItem.qty;
        accumulator[warehouseIndex].warehouseAvailableQty += stockItem.available;
        accumulator[warehouseIndex].warehouseBookedQty += stockItem.booked;
        accumulator[warehouseIndex].warehouseBLs.push({
          blDate: stockItem.date,
          bl: stockItem.bl,
          blQty: stockItem.qty,
          blBookedQty: stockItem.booked,
          blAvailableQty: stockItem.available,
        });
      } else {
        accumulator.push({
          warehouse: stockItem.warehouse,
          warehouseQty: stockItem.qty,
          warehouseAvailableQty: stockItem.available,
          warehouseBookedQty: stockItem.booked,
          warehouseBLs: [
            {
              bl: stockItem.bl,
              blQty: stockItem.qty,
              blBookedQty: stockItem.booked,
              blAvailableQty: stockItem.available,
              blDate: stockItem.date,
            },
          ],
        });
      }
      return accumulator;
    }, []);
    stock.push({
      productId: product._id,
      image: product.image[0],
      brand: product.brand,
      code: product.code,
      capacity: product.capacity,
      updatedAt: product.updatedAt,
      productWarehouseQuantities,
      productQty,
      productBookedQty,
      productAvailableQty,
    });
  });
  res.json(stock);
};

export const createPackingList = async (req, res) => {
  const { exporter, /*pklNo,*/ piNo, invoiceNo, customer, buyer, date, truckItems } = req.body;
  const pkl = { exporter, piNo, invoiceNo, customer, buyer, date, truckItems };
  const newPackingList = new PackingList(pkl);
  try {
    await newPackingList.save();
    res.status(201).json(newPackingList);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const get = async (req, res) => {
  const { exporter, /*pklNo,*/ piNo, invoiceNo, customer, buyer, date, truckItems } = req.body;
  const pkl = { exporter, piNo, invoiceNo, customer, buyer, date, truckItems };
  const newPackingList = new PackingList(pkl);
  try {
    await newPackingList.save();
    res.status(201).json(newPackingList);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateProductWarehouseBlQty = async (req, res) => {
  const id = req.params.id;
  const { code, qty, date, warehouse, booked } = req.body;

  console.log({ code, qty, date, warehouse, booked });

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No product with id: ${id}`);
  try {
    const stockItem = await StockItem.findOne({
      productId: id,
      warehouse: warehouse,
      bl: code,
    });
    if (!stockItem) {
      res.json({ error: "No stock item found" });
      return;
    }
    stockItem.qty = qty;
    stockItem.available = qty;
    try {
      stockItem.save();
      res.json(stockItem);
    } catch (e) {
      res.json({ error: e });
    }
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

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
    const updatedStockItem = await StockItem.findOne({ productId: id });
    if (!updatedStockItem) {
      return res.status(404).json({ error: "Product not found" });
    }
    updatedStockItem.qty = stock;
    updatedStockItem.available = stock;

    try {
      await updatedStockItem.save();
      return res.json({
        message: "Product srock updated successfully",
        updatedStockItem,
      });
    } catch (e) {
      res.json({ error: e });
    }
  } catch (error) {
    console.error("Error updating product stock:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                UPDATE STOCK                                */
/* -------------------------------------------------------------------------- */
export const updateStock = async () => {
  try {
    const products = await Product.find();
    const stockItems = await StockItem.find();
    console.log(products.length);
    console.log(stockItems.length);

    await Promise.all(
      products.map(async (product) => {
        const productStockItems = stockItems.filter((item) => item.productId.includes(product._id));
        const totalQuantity = productStockItems.reduce((acc, item) => acc + item.qty, 0);

        product.stock = totalQuantity;
        await product.save();
      })
    );

    console.log();
    ({ message: "Stock updated successfully" });
  } catch (error) {
    console.log();
    ({ error: error });
  }
};
