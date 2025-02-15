/*===============================================
File: accountsController.js
Author: Steven Thomas
Date: January 31, 2025
Purpose: Controller for the accounts views
===============================================*/

// ==============================================
// Section: Require statements and other variables
// ===============================================
const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
require("dotenv").config()
const accountController = {};

// ==============================================
// Section: Account Management
// ===============================================

// Build the account management page
accountController.buildAccountManager = async function(req, res, next) {
    const nav = await utilities.getNav()

    res.render("account/account-management", {
        title: "Account Management",
        nav,
        errors: null
    })
}

// ==============================================
// Section: Login
// ===============================================

// Build the login page
accountController.buildLogin = async function (req, res, next) {
  const nav = await utilities.getNav();

  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
};

accountController.accountLogin = async function(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash(
            "notice",
            "Please check you credentials and try again."
        )
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, 
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 3600 * 1000 }
            )

            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })

            }
            res.redirect("/account/")
        }
    } catch (error) {
        return new Error("Access Forbidden")
    }
}


// ==============================================
// Section: Registration
// ===============================================

// Build the registration page
accountController.buildRegistration = async function (req, res, next) {
  const nav = await utilities.getNav();

  res.render("account/registration", {
    title: "Registration",
    nav,
    errors: null,
  });
};

// Handle account registration
accountController.registerAccount = async function(req, res) {
    let nav = await utilities.getNav()
    const {
        account_firstname,
        account_lastname,
        account_email,
        account_password,
    } = req.body

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash(
            "notice",
            "Sorry, there was an error processing the registration"
        )
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
        })
    }


    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, ${account_firstname}! You've successfully registered an account. Please log in.`
        )
        res.status(201).redirect("/account/login")
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

module.exports = accountController;
