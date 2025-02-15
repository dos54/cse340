/*===============================================
File: inventory-model.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: All the functions required to interact
    with the classification and inventory tables
    of the database
===============================================*/

const pool = require("../database");
let cache = {}

// ==============================================
// Section: Get all classification data
// ===============================================
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

// Get all inventory items and classification_name by classification_id
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
      [classification_id]
    );


    return data.rows;
  } catch (error) {
    console.error(`getclassificationsbyid error: ${error}`);
    throw error;
  }
}

async function getInventoryItemById(inv_id) {
  const sql = `
    SELECT * FROM inventory WHERE inv_id = $1
  `
  let data = await pool.query(sql, [inv_id])

  if (!data.rows > 0 ) {
    throw new Error("No item found with the id ", inv_id)
  }

  return data.rows[0]
}

async function updateInventoryItem(
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
) {
  const sql = `
    UPDATE inventory 
    SET
      inv_make = $2,
      inv_model = $3,
      inv_description = $4,
      inv_image = $5,
      inv_thumbnail = $6,
      inv_price = $7,
      inv_year = $8,
      inv_miles = $9,
      inv_color = $10,
      classification_id = $11
    WHERE inventory.inv_id = $1
  `;
  try {
    const data = await pool.query(sql, [
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
      classification_id,
    ]);

    return data.rows;
  } catch (error) {
    console.log("Error updating vehicle ", inv_id, " ", error);
  }
}

async function getProductDetails(product_id) {
  if (!cache.product) cache.product = {}
  if (cache.product[product_id] && (cache.product[product_id].timestamp > Date.now() - 600 * 1000)) {
    console.log(`Serving cached data for product: ${product_id}`)
    return cache.product[product_id].data
  }
  try {
    const data = await pool.query(
      `
            SELECT  inv_make as make, 
                    inv_model as model, 
                    inv_year as year, 
                    inv_description as description, 
                    inv_image as image,
                    inv_price as price,
                    inv_miles as miles,
                    inv_color as color,
                    classification_name as type
            FROM public.inventory as inventory
            JOIN public.classification as classification
            ON inventory.classification_id = classification.classification_id
            WHERE inventory.inv_id = $1
            `,
      [product_id]
    );

    cache.product[product_id] = {
      data: data.rows[0],
      timestamp: Date.now()
    }

    if (data.rows.length === 0) {
      throw new Error(`No product found with the ID ${product_id}`);
    }
    console.log(data.rows[0])
    return data.rows[0];
  } catch (error) {
    console.error(
      `Error getting details for the product with id ${product_id}: ${error}`
    );
  }
}

async function addNewClassification(
  classification_name
) {
  try {
    const sql = `INSERT INTO classification (classification_name) 
                        VALUES ($1) 
                        RETURNING *`
    return await pool.query(
      sql,
      [
        classification_name
      ]
    )
  } catch (error) {
    return error.message
  }
}

async function checkExistingClassification(classification_name) {
  try {
    const sql = `SELECT * FROM classification WHERE classification_name = $1`
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error) {
    return error.message
  }
}

async function addNewVehicle(
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
) {
  try {
    const sql = `
      INSERT INTO inventory (
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
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      ) RETURNING *
    `

    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    return error.message
  }
}

async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    new Error(`There was an error when trying to delete item with id: ${inv_id}`)
  }
}

function invalidateInventoryCache() {
  cache = {}
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getProductDetails,
  addNewClassification,
  checkExistingClassification,
  addNewVehicle,
  invalidateInventoryCache,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
};
