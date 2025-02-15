'use strict'

const classificationList = document.querySelector("#classificationList");

classificationList.addEventListener("change", function (event) {
    let classification_id = classificationList.value
    console.log(`classification_id is: ${classification_id}`)
    let classIdURL = "/inv/getInventory/"+classification_id
    fetch(classIdURL)
        .then(function (response ){
            if (response.ok) {
                return response.json()
            } 
            throw Error("Network response was not OK")
        })
        .then(function (data) {
            console.log(data)
            buildInventoryList(data)
        })
        .catch(function (error) {
            console.log(`There was a problem: ${error.message}`)
        })
})

function buildInventoryList(data) {
    let inventoryDisplay = document.querySelector("#inventory-display")

    if (!data.length) {
        inventoryDisplay.innerHTML = "<p>No vehicles found for that classification</p>"
        return
    }

    let dataTable = `
    <thead>
        <tr><th>Vehicle Name</th><td>&nbsp;</td></tr>
    </thead>
    <tbody>
        ${data
          .map(
            (element) =>
              `
                <tr><td>
                    <a href="/inv/detail/${element.inv_id}" title="${element.inv_year} ${element.inv_make} ${element.inv_model} Product Page">${element.inv_year} ${element.inv_make} ${element.inv_model}</a>
                </td>
                <td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>
                <td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>
            `
          )
          .join("")}
    </tbody>
    `;

    inventoryDisplay.innerHTML = dataTable
}


