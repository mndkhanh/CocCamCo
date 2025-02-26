/**
 * Generate a random code which is string, maybe "001234"
 * 
 * @param {*} length 
 * @returns string
 */
function generateStringCode(length = 6) {
  // Ensure the length is valid (greater than 0)
  if (length <= 0) {
    throw new Error('Code length must be greater than 0');
  }

  let code = '';
  const digits = '0123456789'; // Allowed characters for the code (numbers only)

  // Generate a random code of the specified length
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length); // Random index
    code += digits[randomIndex]; // Add the random digit to the code
  }

  return code;
}


/**
 * Generate a ramdom code which is a number, not contain 012345
 * 
 * @param {*} length 
 * @returns 
 */
function generateIntCode(length = 6) {
  return Math.floor(100000 + Math.random() * 900000);
}

function getVNDate(timestamp) { //Format: 16:52:01 25/01/2025
  return new Date(timestamp).toLocaleString('vi-VN', {
    day: '2-digit',    // Day (e.g., 25)
    month: '2-digit',  // Month (e.g., 01)
    year: 'numeric',   // Year (e.g., 2025)
    hour: '2-digit',   // Hour in 24-hour format (e.g., 14)
    minute: '2-digit', // Minute (e.g., 30)
    second: '2-digit', // Second (e.g., 45)
    hour12: false,     // 24-hour clock
  });
}


export { generateIntCode, generateStringCode };