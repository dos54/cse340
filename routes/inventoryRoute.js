/*===============================================
File: inventoryRoute.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Deliver inventory items, based on their classification,
    to the browser.
===============================================*/

// Needed resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const vehiclesValidate = require("../utilities/vehicle-validation")
const inventoryController = require("../controllers/invController")

// Route to build the inventory by classification view
router.get("/", utilities.handleErrors(invController.buildVehicleManagerPage))
router.get("/new-classification", utilities.handleErrors(invController.buildNewClassificationPage))
router.get("/new-vehicle", utilities.handleErrors(invController.buildNewVehiclePage))
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:productId", utilities.handleErrors(invController.buildProductDetailsById))

router.post(
    "/add-classification",
    vehiclesValidate.newClassificationRules(), // Pass a [ruleset] (list of rules)
    vehiclesValidate.checkClassificationData, // Pass the function used to validate the data
    utilities.handleErrors(inventoryController.addNewClassification)
)

router.post(
    "/add-vehicle",
    vehiclesValidate.newVehicleRules(),
    vehiclesValidate.checkNewVehicleData,
    utilities.handleErrors(inventoryController.addNewVehicle)
)

module.exports = router