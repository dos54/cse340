/*===============================================
File: invController.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Controller for the inventory route.
===============================================*/

const inventoryModel = require("../models/inventory-model");
const commentModel = require("../models/comment-model")
const utilities = require("../utilities/");

const inventoryController = {};

// ==============================================
// Section: Build inventory by classification view
// ===============================================
inventoryController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await inventoryModel.getInventoryByClassificationId(
    classification_id
  );
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

inventoryController.buildProductDetailsById = async function (req, res, next) {
  const product_id = req.params.productId;
  const data = await inventoryModel.getProductDetails(product_id);
  let commentsSection = await utilities.getCommentsSection(product_id)
  let view = await utilities.buildDetailedProductView(data);
  let nav = await utilities.getNav();
  const productName = `${data.year} ${data.make} ${data.model}`;
  res.render("./inventory/product-details", {
    title: productName,
    nav,
    view,
    commentsSection,
    product_id,
  });
};

inventoryController.addComment = async function (req, res, next) {
  try {
    const {
      account_id,
      inv_id,
      comment_content,
    } = req.body

    if (!account_id || !inv_id || !comment_content.trim()) {
      req.flash("notice","Invalid comment data.")
      res.redirect(`/inv/detail/${inv_id}`);
      throw error
    }

    if (comment_content.trim().length < 10) {
      req.flash("notice", "Your comment was too short.")
      res.redirect(`/inv/detail/${inv_id}`);
      throw error
    }
  
    const commentCreationResults = await commentModel.addComment(account_id, inv_id, comment_content)
    if (commentCreationResults) {
      req.flash(
        "notice",
        "Comment successfully added"
      )
    } else {
      req.flash(
        "notice",
        "There was an error adding your comment"
      )
    }
    
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    console.error("Error adding comment:", error)
    req.flash("notice", "An unexpected error ocurred")
    return res.redirect(`/inv/details/${inv_id}`)
  }
}

inventoryController.buildInventoryManagerPage = async function (
  req,
  res,
  next
) {
  let nav = await utilities.getNav();
  const classificationDropdown =
    await utilities.buildClassificationDropdownList();
  res.render("./inventory/inventory-manager", {
    title: "Vehicle Management",
    nav,
    classificationDropdown,
  });
};

inventoryController.buildDeleteInventoryItemView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await inventoryModel.getInventoryItemById(inv_id)
  const itemName = `${itemData.inv_year} ${itemData.inv_make} ${itemData.inv_model}`;

  res.render(
    "./inventory/delete-inventory",
    {
      title: `Delete ${itemName}`,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_price: itemData.inv_price,
      inv_year: itemData.inv_year
    }
  )
}

inventoryController.deleteItem = async function (req, res, next) {
  let nav = utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await inventoryModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The deletion was successful")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

inventoryController.buildEditInventoryItemView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await inventoryModel.getInventoryItemById(inv_id)
  const classificationDropdown = await utilities.buildClassificationDropdownList(itemData.classification_id)
  const itemName = `${itemData.inv_year} ${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: `Edit ${itemName}`,
    nav,
    errors: null,
    classificationsDropdown: classificationDropdown,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

inventoryController.updateVehicleDetails = async function (req, res) {
  let nav = await utilities.getNav()

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
  } = req.body

  const updateResults = await inventoryModel.updateInventoryItem(
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
    inv_color
  )

  if (updateResults) {
    const itemName = inv_make + " " + inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationDropdown = await utilities.buildClassificationDropdownList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationDropdown: classificationDropdown,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
}

inventoryController.buildNewClassificationPage = async function (
  req,
  res,
  next
) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  });
};

inventoryController.addNewClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  const newClassificationResult = await inventoryModel.addNewClassification(
    classification_name
  );

  if (newClassificationResult) {
    utilities.invalidateNavCache();
    req.flash("notice", `Added new classification ${classification_name}`);
    res.status(201).redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, there was a problem adding the classification");
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
};

inventoryController.buildNewVehiclePage = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationsList = await utilities.buildClassificationDropdownList();

  res.render("./inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationsList,
    errors: null,
  });
};

inventoryController.addNewVehicle = async function (req, res) {
  let nav = await utilities.getNav();

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
    inv_color,
  } = req.body;

  const newVehicle = await inventoryModel.addNewVehicle(
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
  );

  if (newVehicle && newVehicle.rowCount > 0) {
    console.log("Something went right I guess?");
    inventoryModel.invalidateInventoryCache();
    req.flash("notice", "Successfully added vehicle to inventory");
    res.status(201).redirect("/inv/");
  } else {
    console.log("There was a problem adding the vehicle");

    let classificationsList = await utilities.buildClassificationDropdownList(
      classification_id || ""
    );
    console.log("Good thing there's a classiifcations list for us to use!");
    req.flash("notice", "Sorry, there was a problem adding the vehicle");
    res.status(501).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      errors: null,
      classificationsList: classificationsList,
    });
  }
};

// Return inventory by classification as JSON
inventoryController.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const inventoryData = await inventoryModel.getInventoryByClassificationId(
      classification_id
    );
    if (inventoryData && inventoryData.length > 0) {
      return res.json(inventoryData);
    } else {
      return res.status(404).json({ error: "No data returned" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = inventoryController;
