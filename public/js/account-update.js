const form = document.querySelector("#updateForm")
const passwordForm = document.querySelector("#updatePasswordForm")

form.addEventListener("change", function () {
    const updateButton = form.querySelector("button")
    updateButton.removeAttribute("disabled")
})

passwordForm.addEventListener("change", function () {
    const updateButton = passwordForm.querySelector("button")
    updateButton.removeAttribute("disabled")
})