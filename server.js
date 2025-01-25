/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")

const utilities = require("./utilities")
const reviews = require('./data/reviews.json')
const baseController = require("./controllers/baseController")

/* ***********************
* View Engine and Templates
* ********************** */
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// File not found route- should always be the last in the list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/**
 * Express Error Handler
 * Place after all other middleware
 * Unit 3, Basic Error Handling Activity
 */
app.use( async (error, request, result, next) => {
  let nav = await utilities.getNav() // Build the navigation bar
  console.error(`Error at: "${request.originalUrl}": ${error.message}`) // Send error to console with the requested Url and the message
  if(error.status == 404) {
    message = error.message
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?"
  }
  result.render("errors/error", { // Call the error.ejs view
    title: error.status || 'Server Error', // Title for the view
    message: message, // Message for the view
    nav // Pass the nav bar that we built previously
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})