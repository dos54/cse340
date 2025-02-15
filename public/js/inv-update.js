const form = document.querySelector("#updateForm")

form.addEventListener("change", function () {
    const updateButton = form.querySelector("button")
    updateButton.removeAttribute("disabled")
})