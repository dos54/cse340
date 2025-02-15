/*===============================================
File: accountRoute.js
Author: Steven Thomas
Date: January 31, 2025
Purpose: Route for the accounts views
===============================================*/

const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const registrationValidate = require("../utilities/account-validation")


// ==============================================
// Section: Handle Logins
// ===============================================
router.get("/", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManager)
)
router.get("/login/", utilities.handleErrors(accountController.buildLogin));

router.post(
  "/login",
  // registrationValidate.loginRules(),
  // registrationValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// ==============================================
// Section: Handle Registration
// ===============================================
router.get(
  "/registration/",
  utilities.handleErrors(accountController.buildRegistration)
);

router.post(
    "/register",
    registrationValidate.registrationRules(),
    registrationValidate.checkRegistrationData,
    utilities.handleErrors(accountController.registerAccount)
)


module.exports = router;
