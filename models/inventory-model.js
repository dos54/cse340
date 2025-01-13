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
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

module.exports = {getClassifications}