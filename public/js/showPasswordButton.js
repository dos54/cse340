const passwordButtons = document.querySelectorAll(".unhide-password");
const passwordInputs = document.querySelectorAll("input[type=password]");

passwordButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const input = passwordInputs[index]; // Get the corresponding input field

    if (input.type === "password") {
      input.type = "text";
      button.textContent = "Hide Password"; // Change button text
    } else {
      input.type = "password";
      button.textContent = "Show Password"; // Change button text
    }
  });
});
