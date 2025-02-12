/*===============================================
File: accountsController.js
Author: Steven Thomas
Date: January 31, 2025
Purpose: Controller for the accounts views
===============================================*/

const utilities = require("../utilities/");
const accountModel = require("../models/account-model")
const bcrypt = require('bcryptjs')
const accountController = {};

accountController.buildLogin = async function (req, res, next) {
  const nav = await utilities.getNav();

  res.render("account/login", {
    title: "Login",
    nav,
  });
};

accountController.buildRegistration = async function (req, res, next) {
  const nav = await utilities.getNav();

  res.render("account/registration", {
    title: "Registration",
    nav,
    errors: null,
  });
};

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
