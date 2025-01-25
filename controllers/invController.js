/*===============================================
File: invController.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Controller for the inventory route.
===============================================*/

const inventoryModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const inventoryController = {};

// ==============================================
// Section: Build inventory by classification view
// ===============================================
inventoryController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await inventoryModel.getInventoryByClassificationId(
    classification_id
  );
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

inventoryController.buildProductDetailsById = async function (req, res, next) {
  const product_id = req.params.productId
  const data = await inventoryModel.getProductDetails(product_id)
  let view = await utilities.buildDetailedProductView(data)
  let nav = await utilities.getNav()
  const productName = `${data.year} ${data.make} ${data.model}`
  res.render("./inventory/product-details", {
    title: productName,
    nav,
    view
  })
};

module.exports = inventoryController;
