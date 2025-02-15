const utilites = require(".")
const {body, validationResult} = require("express-validator")
const inventoryModel = require("../models/inventory-model")
const validate = {}

validate.newClassificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .isString()
            .isAlpha()
            .isLength({min: 1})
            .withMessage("Classification name must be alphabetic characters only.")
            .custom(async (classification_name) => {
                const classificationExists = await inventoryModel.checkExistingClassification(
                    classification_name
                )
                if (classificationExists) {
                    throw new Error(
                        "That vehicle classification already exists!"
                    )
                }
            })
    ]
}

validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilites.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name
        })
        return
    }
    next()
}

validate.newVehicleRules = () => {
    return [
      body("classification_id")
        .trim()
        .isInt({ min: 1 })
        .withMessage("Classification must be a valid integer."),

      body("inv_make")
        .trim()
        .isString()
        .isLength({ min: 3 })
        .withMessage("Make must be at least 3 characters long."),

      body("inv_model")
        .trim()
        .isString()
        .isLength({ min: 3 })
        .withMessage("Model must be at least 3 characters long."),

      body("inv_description")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Description must be at least 3 characters long."),

      body("inv_image")
        .trim()
        .isString()
        .withMessage("Image path must be a valid string."),

      body("inv_thumbnail")
        .trim()
        .isString()
        .withMessage("Thumbnail path must be a valid string."),

      body("inv_price")
        .trim()
        .isInt({ min: 0 })
        .withMessage("Price must be a valid positive integer."),

      body("inv_year")
        .trim()
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage("Year must be a valid year."),

      body("inv_miles")
        .trim()
        .isInt({ min: 0 })
        .withMessage("Miles must be a positive integer."),

      body("inv_color")
        .trim()
        .isString()
        .isLength({ min: 3 })
        .withMessage("Color must be at least 3 characters long.")
    ];
}

validate.checkNewVehicleData = async (req, res, next) => {
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
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilites.getNav()
        let classifications = await inventoryModel.getClassifications()
        res.render("inventory/add-vehicle", {
            errors,
            title: "Add New Vehicle",
            classifications: classifications.rows,
            nav,
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
        })
        return
    }
    next()
}

validate.checkUpdateVehicleData = async (req, res, next) => {
  const {
    classification_id,
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilites.getNav();
    let classifications = await inventoryModel.getClassifications();
    const itemName = `${inv_year} ${inv_make} ${inv_model}`;
    res.render("inventory/edit-inventory", {
      errors,
      title: `Edit ${itemName}`,
      classifications: classifications.rows,
      nav,
      classification_id,
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};


module.exports = validate