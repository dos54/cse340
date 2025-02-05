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
const bodyParser = require("body-parser")
// const cookieParser = require("cookie-parser")

const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")

const utilities = require("./utilities")
const reviews = require('./data/reviews.json')
const baseController = require("./controllers/baseController")

const session = require("express-session")
const pool = require("./database/")


/* ***********************
* Middleware
* ********************** */
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express messages middleware
app.use(require('connect-flash')())
app.use(function(req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


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

// Accounts Route
app.use("/account", require('./routes/accountRoute'))

// File not found route- should always be the last in the list
app.use(async (req, res, next) => {
  next({
    status: 404,
    message:
      "🌀 Whoops, you broke the internet! Just kidding, but this page is missing. Click around and keep exploring! 🌟",
  });
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
    message =
      "😅 Uh-oh! Our server encountered an error. Don’t worry, it’s just as embarrassed as we are 🙈. While we fix this 🔧, why not try exploring a different page? 🗺️ Click around and see what you discover!";
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