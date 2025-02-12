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

inventoryController.buildVehicleManagerPage = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/inventory-manager", {
    title: "Vehicle Management",
    nav,

  })
}

inventoryController.buildNewClassificationPage = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null
  })
}

inventoryController.addNewClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const {
    classification_name
  } = req.body

  const newClassificationResult = await inventoryModel.addNewClassification(
    classification_name
  )

  if (newClassificationResult) {
    utilities.invalidateNavCache()
    req.flash(
      "notice",
      `Added new classification ${classification_name}`
    )
    res.status(201).redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, there was a problem adding the classification")
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

inventoryController.buildNewVehiclePage = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classifications = await inventoryModel.getClassifications();

  res.render("./inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classifications: classifications.rows,
    errors: null,
  });
}

inventoryController.addNewVehicle = async function (req, res) {
  let nav = await utilities.getNav()

  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  } = req.body

  const newVehicle = inventoryModel.addNewVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  );

  if (newVehicle) {
    inventoryModel.invalidateInventoryCache()
    req.flash(
      "notice",
      "Successfully added vehicle to inventory"
    )
    res.status(201).redirect("/inv/")
  } else {
    req.flash(
      "notice",
      "Sorry, there was a problem adding the vehicle"
    );
    res.status(501).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      errors: null,
    });
  }
}

module.exports = inventoryController;
