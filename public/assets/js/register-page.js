document.querySelectorAll('.code-input').forEach((input, index, inputs) => {
      input.addEventListener('input', (e) => {
            // Ensure only a single digit is entered by restricting the input value
            if (e.target.value.length > 1) {
                  e.target.value = e.target.value[0]; // Keep only the first digit
            }

            // Move focus to the next input field if the current one has a value
            if (e.target.value.length > 0 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
            }
      });

      input.addEventListener('keydown', (e) => {
            // Handle Backspace key to move focus to the previous input field
            if (e.key === 'Backspace') {
                  if (input.value.length === 0 && index > 0) {
                        // Move focus to the previous input field if current one is empty
                        inputs[index - 1].focus();
                  } else if (input.value.length > 0) {
                        // If the current input has a value, delete the value without moving focus
                        input.value = '';
                  }
            }

            // Handle ArrowLeft and ArrowRight to navigate between inputs
            else if (e.key === 'ArrowLeft' && index > 0) {
                  inputs[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                  inputs[index + 1].focus();
            }
      });

      // Prevent unwanted non-numeric input characters
      input.addEventListener('input', (e) => {
            // Allow only digits 0-9
            if (!/^[0-9]$/.test(e.target.value)) {
                  e.target.value = ''; // Clear the input if non-numeric value is entered
            }
      });
});

let codeInputs = document.querySelectorAll("#verificationCodeContainer input");
codeInputs[0].addEventListener("paste", (e) => {
      const pasteData = e.clipboardData.getData("text").split("");
      codeInputs.forEach((input, index) => {
            input.value = pasteData[index] || "";
      });
      codeInputs[pasteData.length - 1]?.focus();
});
