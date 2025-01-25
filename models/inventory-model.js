/*===============================================
File: inventory-model.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: All the functions required to interact
    with the classification and inventory tables
    of the database
===============================================*/

const pool = require("../database");

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
  }
}

async function getProductDetails(product_id) {
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

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getProductDetails,
};
