/*===============================================
File: index.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Hold some utility functions
===============================================*/

const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model")
const commentModel = require("../models/comment-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {};
const cache = {}

// ==============================================
// Section: Constructs the nav HTML unordered list
// ===============================================
Util.getNav = async function (req, res, next) {
  if (cache.nav && (cache.timestamp > Date.now() - 3600 * 1000)) {
    console.log("Serving cached nav data.")
    return cache.nav
  }

  let data = await invModel.getClassifications();
  const list = `
    <ul>
        <li><a href="/" title="Home Page">Home</a></li>
        ${data.rows
          .map(
            (row) => `
            <li>
                <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>
            </li>
        `
          )
          .join("")}
    </ul>
    `;

  cache.nav = list
  cache.timestamp = Date.now()

  return list;
};

Util.getCommentsSection = async function (product_id) {
  let data = await commentModel.getCommentsByInventoryId(product_id)
  if (data.length > 0) {
    const commentsSection = `
      <ul>
          ${data
            .map(
              (row) => `
                <li data-comment-id="${row.comment_id}">
                  <h3>${row.account_firstname}</h3>
                  <p>${row.comment_content}</p>
                </li>
              `
            ).join("")
          }
      </ul>
    `
    return commentsSection
  } else {
    return "<p>No comments yet.</p>"
  }
}

// ==============================================
// Section: Build the classification view in HTML
// ===============================================
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = `
        <ul id="inv-display">
            ${data
              .map(
                (vehicle) => `
                <li>
                    <a href="../../inv/detail/${vehicle.inv_id}" title="View ${
                  vehicle.inv_make
                } ${vehicle.inv_model} details">
                        <img loading="lazy" class="vehicle-image" src="${
                          vehicle.inv_thumbnail
                        }" alt="Image of ${vehicle.inv_make} ${
                  vehicle.inv_model
                } on CSE Motors">
                    </a>
                    <div class="namePrice">
                        <h2>
                            <a href="../../inv/detail/${
                              vehicle.inv_id
                            }" title="View ${vehicle.inv_make} ${
                  vehicle.inv_model
                } details">
                                ${vehicle.inv_make} ${vehicle.inv_model}
                            </a>
                        </h2>
                        <span>$${new Intl.NumberFormat("en-US").format(
                          vehicle.inv_price
                        )}</span>
                    </div>
                    
                </li>
            `
              )
              .join("")}
        </ul>
        `;
  } else {
    grid = `<p class="notice">Sorry, no matching vehicles could be found.</p>`;
  }
  return grid;
};

// ==============================================
// Section: Build the product details view in HTML
// ===============================================
Util.buildDetailedProductView = async function (product) {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(product.price)

  const miles = new Intl.NumberFormat("en-US", {
    style: 'decimal',
  }).format(product.miles)

  let view;
  if (product) {
    view = `
        <section class="product-view">
            <img src="${product.image}" loading="lazy" alt=""></img>
            <section class="product-details">
                <h2>${product.make} ${product.model} Details</h2>
                <ul>
                    <li id=product-price>
                        <p>Price</p>
                        <p>${price}</p>
                    </li>
                    <li id=product-description>
                        <p>Description</p>
                        <p>${product.description}</p>
                    </li>
                    <li id=product-color>
                        <p>Color</p>
                        <p>${product.color}</p>
                    </li>
                    <li id=product-miles>
                        <p>Miles</p>
                        <p>${miles}</p>
                    </li>

                </ul>
            </section>
        </section>
        `;
  } else {
    view = `<p class="notice">Sorry, the requested vehicle is not in our inventory.</p>`;
  }
  return view;
};

Util.buildClassificationDropdownList = async function (selectedId = "") {
  console.log("Building list")
  try {
    const classifications = await invModel.getClassifications()
    const rows = classifications.rows
    let list = `
      <select name="classification_id" class="classification-list" id="classificationList">
        <option value="" disabled selected>Choose a classification</option>
        ${rows.map(
          (classification) => 
            `<option value="${classification.classification_id}"
                ${classification.classification_id == selectedId ? "selected" : ""}>
              ${classification.classification_name}
            </option>`
        ).join("")}
      </select>  
    `
    return list
  } catch (error) {
    throw new Error("There was a problem creating the classifications dropdown list.")
  }
}

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next).catch(next));

Util.invalidateNavCache = async function () {
  cache.nav = null;
  cache.timestamp = null;
  await Util.getNav()
}

// Middleware to check token validity
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/acount/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

const privilegedRoles = [
  "Employee",
  "Admin"
]

Util.checkPrivilegedRole = async function (req, res, next) {
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const data = await accountModel.getAccountByEmail(res.locals.accountData.account_email)
  if (privilegedRoles.includes(data.account_type)) {
    return next()
  }

  req.flash("notice", "Sorry, but you don't have permission to do that.")
  return res.redirect("/")
}

// Ensure that users can only edit their own data
Util.verifyOwnership = async function (req, res, next) {
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const userId = req.params.account_id || req.body.account_id

  if (!userId) {
    req.flash("notice", "Invalid request")
    return res.redirect("/")
  }

  const data = await accountModel.getAccountByUserId(
    userId
  );
  if (res.locals.accountData.account_id === data.account_id) {
    return next();
  }

  req.flash("notice", "Sorry, but you don't have permission to do that.");
  return res.redirect("/");

}

module.exports = Util;

