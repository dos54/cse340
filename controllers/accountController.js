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

// ==============================================
// Section: Log out
// ===============================================
accountController.logout = async function (req, res, next) {
    const returnurl = req.get("Referer") || "/"
    req.flash("notice", "You successfully logged out.")
    res.clearCookie("jwt")
    res.redirect(returnurl)
}

// ==============================================
// Section: Edit account
// ===============================================


accountController.updateAccountView = async function (req, res, next) {
    const userId = req.params.account_id
    let nav = await utilities.getNav()
    let data = await accountModel.getAccountByUserId(userId)

    res.render("account/update-account", {
        title: "Update Account Information",
        nav,
        errors: null,
    })
}

accountController.updateAccountInformation = async function (req, res, next) {
    const {
        account_id,
        account_firstname,
        account_lastname,
        account_email
    } = req.body

    const accountData = await accountModel.updateAccountInformation(account_id, account_firstname, account_lastname, account_email)

    if (accountData) {
        const accessToken = jwt.sign(
            accountData,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: 3600 * 1000 }
        );

        if (process.env.NODE_ENV === "development") {
            res.cookie("jwt", accessToken, {
            httpOnly: true,
            maxAge: 3600 * 1000,
            });
        } else {
            res.cookie("jwt", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 3600 * 1000,
            });
        }

      req.flash(
        "notice",
        "Congratulations, your account information has been updated."
      );
      res.status(201).redirect("/account/");
    } else {
        let nav = utilities.getNav()
        req.flash("notice", "Sorry, there was a problem updating your account information.");
        res.status(501).render("account/update-account", {
        title: "Update Account Information",
        nav,
        errors: null,
      });
    }
}

accountController.updateAccountPassword = async function (req, res, next) {
    const {
        account_id,
        account_password
    } = req.body

    let hashedPassword;
    try {
        hashedPassword = bcrypt.hashSync(account_password, 10);
    } catch (error) {
        let nav = utilities.getNav();
        req.flash(
        "notice",
        "Sorry, there was an error updating your password"
        );
        res.status(500).render(`account/update-account`, {
          title: "Update Account Information",
          nav,
          errors: null,
        }); 
    }

    const accountData = accountModel.updateAccountPassword(account_id, hashedPassword)
    if (accountData) {
        req.flash(
          "notice",
          "Congratulations, your account information has been updated."
        );
        res.status(201).redirect("/account/");
    }

}

module.exports = accountController;
