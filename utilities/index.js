/*===============================================
File: index.js
Author: Steven Thomas
Date: January 12, 2025
Purpose: Hold some utility functions
===============================================*/

const invModel = require('../models/inventory-model')
const Util = {}

// ==============================================
// Section: Constructs the nav HTML unordered list
// ===============================================
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data.rows)
    const list = `
    <ul>
        <li><a href="/" title="Home Page">Home</a></li>
        ${data.rows.map(row => `
            <li>
                <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>
            </li>
        `).join('')}
    </ul>
    `



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
    return list
}

module.exports = Util