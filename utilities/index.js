/*===============================================
File: index.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Hold some utility functions
===============================================*/

const invModel = require("../models/inventory-model");
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

  // This is the code given to us by the assignment. It is very hard to read, which I do not like, so I used a map function and
  // template literals instead.

  // let list = "<ul>"
  // list += '<li><a href="/" title="Home page">Home</a></li>'
  // data.rows.forEach(row => {
  //     list += "<li>"
  //     list += '<a href="/inv/type/' +
  //         row.classification_id +
  //         '" title="See our inventory of ' +
  //         row.classification_name +
  //         ' vehicles">' +
  //         row.classification_name +
  //         "</a>"
  //     list += "</li>"
  // })
  return list;
};

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

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next).catch(next));

module.exports = Util;
