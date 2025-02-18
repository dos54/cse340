/*===============================================
File: account-model.js
Author: Steven Thomas
Date: January 31, 2025
Purpose: Model file for account actions
===============================================*/

const pool = require("../database/");

// ==============================================
// Section: Register a new account
// ===============================================

async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql = `INSERT INTO account 
        (
            account_firstname,
            account_lastname,
            account_email,
            account_password,
            account_type
        ) VALUES
            ($1,
             $2,
             $3,
             $4,
             'Client'
        ) RETURNING *
        `;
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

async function checkExistingEmail (account_email) {
  try {
    const sql = `SELECT account_email, account_id FROM account WHERE account_email = $1`
    const result = await pool.query(sql, [account_email]);
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    return null
  }
}

async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
      return result.rows[0]
  } catch(error) {
    return new Error("No matching email found.")
  }
}

async function getAccountByUserId(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching user Id found.");
  }
}

async function updateAccountInformation ( account_id, account_firstname, account_lastname, accout_email) {
  try {
    const sql = `
      UPDATE account SET 
        account_firstname = $2, 
        account_lastname = $3, 
        account_email = $4
       WHERE
       account.account_id = $1
       RETURNING account_id, account_firstname, account_lastname, account_email
    `

    const result = await pool.query(sql, [
      account_id,
      account_firstname,
      account_lastname,
      accout_email
    ])
    return result.rowCount > 0 ? result.rows[0] : null
  } catch (error) {
    console.log("There was an error updating your account information")
    return null
  }
}

async function updateAccountPassword (account_id, account_password) {
  try {
    const sql = `UPDATE account SET
      account_password = $2
      WHERE
      account.account_id = $1
      RETURNING account_firstname
        `;
    const result = await pool.query(sql, [
      account_id,
      account_password
    ]);
    return result.rowCount > 0 ? result.rows[0] : null
  } catch (error) {
    console.log("There was an error updating your account information")
    return null
  }

}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountByUserId, updateAccountInformation, updateAccountPassword };
