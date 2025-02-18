const utilites = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

// ==============================================
// Section: Registration Data Validation Rules
// ===============================================

validate.registrationRules = () => {
    return [
      body("account_firstname")
        .trim()
        .isString()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."),

      body("account_lastname")
        .trim()
        .isString()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name."),

      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail({ min: 1 })
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(
            account_email
          );
          if (emailExists) {
            throw new Error(
              "That email already exists. Please login or use a different email."
            );
          }
        }),

      body("account_password")
        .trim()
        .isStrongPassword({
          minLength: 12,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ];
}

validate.checkRegistrationData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilites.getNav()
        res.render("account/registration", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

validate.updateAccountInformationRules = () => {
      return [
      body("account_firstname")
        .trim()
        .isString()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."),

      body("account_lastname")
        .trim()
        .isString()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name."),

      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail({ min: 1 })
        .withMessage("A valid email is required.")
        .custom(async (account_email, {req}) => {
          const existingUser = await accountModel.checkExistingEmail(
            account_email
          );
          if (existingUser && String(existingUser.account_id) !== String(req.body.account_id)) {
            throw new Error(
              "That email already exists. Please use a different email."
            );
          }
        }),
      ]
}

validate.checkAccountInformationData = async (req, res, next) => {
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilites.getNav();
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors,
    });
    return;
  }
  next();
};

validate.updateAccountPasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
}

validate.checkAccountPasswordData = async (req, res, next) => {
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilites.getNav();
    res.render("account/update-account", {
      title: "Update Account Information",
      nav,
      errors,
    });
    return;
  }
  next();

}

module.exports = validate