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

// Route to build the inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

module.exports = router