/*===============================================
File: inventoryRoute.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Deliver inventory items, based on their classification,
    to the browser.
===============================================*/

// Needed resources
const express = require("express");
const router = new express.Router();
const inventoryController = require("../controllers/invController");
const utilities = require("../utilities/");
const vehiclesValidate = require("../utilities/vehicle-validation");


// ==============================================
// Section: Pages / Views
// ===============================================

// Route to build the inventory by classification view
router.get(
  "/",
  utilities.checkPrivilegedRole,
  utilities.handleErrors(inventoryController.buildInventoryManagerPage)
);

// Build a page containing a form to add new classifications
router.get(
  "/new-classification",
  utilities.checkPrivilegedRole,
  utilities.handleErrors(inventoryController.buildNewClassificationPage)
);

// Build a page containing a form to add new vehicles
router.get(
  "/new-vehicle",
  utilities.checkPrivilegedRole,
  utilities.handleErrors(inventoryController.buildNewVehiclePage)
);

// Build a grid displaying inventory items
router.get(
  "/type/:classificationId",
  utilities.handleErrors(inventoryController.buildByClassificationId)
);

// Build a detailed product page for a product
router.get(
  "/detail/:productId",
  utilities.handleErrors(inventoryController.buildProductDetailsById)
);

// Build a page that allows editing a specified inventory item
router.get(
  "/edit/:inv_id",
  utilities.checkPrivilegedRole,
  utilities.handleErrors(inventoryController.buildEditInventoryItemView)
);

router.get(
  "/delete/:inv_id",
  utilities.checkPrivilegedRole,
  utilities.handleErrors(inventoryController.buildDeleteInventoryItemView)
);

// ==============================================
// Section: JSON routes
// ===============================================

// Get the inventory item and return a json object with its details
router.get(
  "/getInventory/:classification_id", 
  utilities.handleErrors(inventoryController.getInventoryJSON)
)

// ==============================================
// Section: POST routes
// ===============================================

// Add a new classification to the database
router.post(
  "/add-classification",
  utilities.checkPrivilegedRole,
  vehiclesValidate.newClassificationRules(), // Pass a [ruleset] (list of rules)
  vehiclesValidate.checkClassificationData, // Pass the function used to validate the data
  utilities.handleErrors(inventoryController.addNewClassification)
);

// Add a new vehicle to the database
router.post(
  "/add-vehicle",
  utilities.checkPrivilegedRole,
  vehiclesValidate.newVehicleRules(),
  vehiclesValidate.checkNewVehicleData,
  utilities.handleErrors(inventoryController.addNewVehicle)
);

// Update a vehicle in the database
router.post(
  "/update-vehicle",
  utilities.checkPrivilegedRole,
  vehiclesValidate.newVehicleRules(),
  vehiclesValidate.checkUpdateVehicleData,
  utilities.handleErrors(inventoryController.updateVehicleDetails)
);

// Delete a vehicle from the database
router.post(
  "/delete",
  utilities.checkPrivilegedRole,
  utilities.handleErrors(inventoryController.deleteItem)
);

router.post(
  "/add-comment",
  utilities.checkLogin,
  utilities.handleErrors(inventoryController.addComment)
)

module.exports = router;
