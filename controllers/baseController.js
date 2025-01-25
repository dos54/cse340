/*===============================================
File: baseController.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Controller responsible for requests to
    the application in general. Not for specific
    areas (such as the inventory or accounts)
===============================================*/

const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("index", { title: "Home", nav });
};

module.exports = baseController;
